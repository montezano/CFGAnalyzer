(function(){
"use strict";

window.Regex = function(str) {
	var self = this;
	var UP = -1;
	var DOWN = 1;
	this.string = str.toString();

	// Checks if this regex is valid.
	function isValid() {
		var modifier = ["?", "*", "+"];
		var lastIsModifier = false;
		for (var i = 0; i < str.length; i++) {
			var currIsModifier = modifier.includes(str[i]);
			if ((str[i-1] == "." || str[i-1] == "(") &&
				(str[i] == ")" || currIsModifier)) {
				return false;
			}
			if ((str[i-1] == "(" || lastIsModifier) && currIsModifier) {
				return false;
			}
			if (!Utilities.operators.includes(str[i]) &&
			 	!["(", ")"].includes(str[i]) &&
				!Utilities.alphabet.includes(str[i])) {
				return false;
			}
			lastIsModifier = currIsModifier;
		}
		return true;
	}

	// Adds concatenation wherever it's implicit. Returns the new regex.
	function normalize() {
		if (!isValid()) {
			console.log("Error: invalid regex");
			return "";
		}
		var noDot = true;
		var normalizedStr = "";
		for (var i = 0; i < str.length; i++) {
			if (str[i] == '.') continue;
			if ((!Utilities.operators.includes(str[i]) && str[i] != ')') && !noDot) {
				normalizedStr += '.';
			}
			normalizedStr += str[i];
			if (str[i] == '(' || str[i] == '|') {
				noDot = true;
			} else {
				noDot = false;
			}
		}
		return normalizedStr;
	}

	// Returns a tree representing the De Simone form of this regex.
	function toDeSimoneTree() {
		var regex = normalize();
		var treeList = [new Node()];
		console.log("Regex: " + regex);
		for (var i = 0; i < regex.length; i++) {
			if (regex[i] == '(') {
				treeList.push(new Node());
				continue;
			}
			var tree = treeList[treeList.length - 1];
			if (regex[i] == ')') {
				if (treeList.length == 1 || !tree.isValid()) {
					console.log("Error: invalid regex");
					break;
				}
				treeList.pop();
				tree.changePriority(10);
				treeList[treeList.length - 1].push(tree);

				// treeList[treeList.length - 1].debug();
				// console.log("--------------");
				continue;
			}
			tree.push(regex[i]);
			treeList[treeList.length - 1] = tree.root();

			// treeList[treeList.length - 1].debug();
			// console.log("--------------");
		}
		treeList[0].setThreadingLinks();
		treeList[0].setTerminalIndexes();
		// treeList[0].debug();

		return treeList[0];
	};

	// Walks through a De Simone tree starting in a single node, returning a
	// set of all terminal nodes found in the way.
	function deSimoneCall(node, direction, nodeList) {
		if (node == null) {
			if (direction == UP) {
				nodeList.push(Node.LAMBDA_INDEX);
			}
			return;
		}

		var left = function() {
			deSimoneCall(node.left, DOWN, nodeList);
		};

		var right = function() {
			deSimoneCall(node.right, DOWN, nodeList);
		};

		var next = function() {
			deSimoneCall(node.threadingLink, UP, nodeList);
		};

		if (!node.isOperator) {
			if (direction == DOWN) {
				nodeList.push(node.index);
			} else {
				next();
			}
			return;
		}

		var heuristicIndex = (direction == DOWN) ? 2 : 3;
		var visitHeuristic = Utilities.operatorInfo[node.data][heuristicIndex];
		for (var i = 0; i < visitHeuristic.length; i++) {
			switch (visitHeuristic[i]) {
				case Utilities.VISIT_LEFT:
					left();
					break;
				case Utilities.VISIT_RIGHT:
					right();
					break;
				case Utilities.VISIT_NEXT:
					while (node.right) {
						node = node.right;
					}
					next();
					break;
			}
		}
	};

	// Walks through a De Simone tree starting in one or more nodes, returning
	// a set of all terminal nodes found in the way.
	function deSimoneStep(node, direction) {
		if (node instanceof Array) {
			var result = [];
			for (var i = 0; i < node.length; i++) {
				if (node[i].direction != UP && node[i].direction != DOWN) continue;
				result = result.concat(deSimoneStep(node[i], node[i].direction));
			}
			return result;
		}

		if (direction != UP && direction != DOWN) return [];
		if (!(node instanceof Node)) return [];

		var result = [];
		deSimoneCall(node, direction, result);
		return result;
	};

	// Walks through a De Simone tree, adding new states to a finite automaton
	// and registering their state compositions to avoid producing equivalent
	// states.
	function produceStates(subtrees, dfa, stateCompositions) {
		if (!(subtrees instanceof Array)) {
			subtrees.direction = DOWN;
			subtrees = [subtrees];
		}
		var composition = deSimoneStep(subtrees);
		Utilities.removeDuplicates(composition);
		for (var i in stateCompositions) {
			if (stateCompositions.hasOwnProperty(i)) {
				if (Utilities.isSameArray(stateCompositions[i], composition)) {
					return;
				}
			}
		}
		console.log(composition);

		var stateName = "q" + dfa.stateList.length;
		dfa.addState(stateName);

		// console.log("=====================");
		var nodeListByTerminal = {};
		for (var i = 0; i < composition.length; i++) {
			if (composition[i] == Node.LAMBDA_INDEX) {
				nodeListByTerminal.lambda = true;
				continue;
			}
			var node = subtrees[0].root().searchByIndex(composition[i]);
			if (!nodeListByTerminal.hasOwnProperty(node.data)) {
				nodeListByTerminal[node.data] = [];
			}

			node.direction = UP;
			nodeListByTerminal[node.data].push(node);
		}
		// console.log(nodeListByTerminal);

		if (nodeListByTerminal.lambda) {
			dfa.acceptState(stateName);
		}
		stateCompositions[stateName] = composition;

		for (var i in nodeListByTerminal) {
			if (i == "lambda") continue;
			if (nodeListByTerminal.hasOwnProperty(i)) {
				produceStates(nodeListByTerminal[i], dfa, stateCompositions);
			}
		}
	};

	// Returns a finite automaton representing this regex.
	this.toFiniteAutomaton = function() {
		var tree = toDeSimoneTree();
		tree.debug();
		var dfa = new FiniteAutomaton();

		var stateCompositions = {};
		produceStates(tree, dfa, stateCompositions);

		// dfa.addStates("q0", "q1", "q2");
		// dfa.acceptState("q2");
		// dfa.addTransition("q0", "a", "q1");
		// dfa.addTransition("q1", "b", "q2");
		// dfa.addTransition("q2", "b", "q2");
		return dfa;
	};

	// Checks if this regex is equivalent to another one.
	this.isEquivalentTo = function(other) {
		if (other instanceof Regex) {
			// TODO
		}
		return false;
	};
};

// var regex = new Regex("b*(ab*ab*)*ab*");
var regex = new Regex("(a|bc)*");
// console.log(regex.toDeSimoneTree());
regex.toFiniteAutomaton();
})();
