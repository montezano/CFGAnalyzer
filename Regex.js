(function(){
"use strict";

window.Regex = function(str) {
	var self = this;
	this.string = str.toString();

	// Checks if this regex is valid.
	function isValid() {
		// TODO
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
			if (!Utilities.operators.includes(str[i]) && !noDot) {
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

	// FIXME: should this method be private?
	// Returns a tree representing the De Simone form of this regex.
	this.toDeSimoneTree = function() {
		var regex = normalize();
		// var root = new Node();
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
		treeList[0].debug();

		return treeList[0];
	};

	// Returns a finite automaton representing this regex.
	this.toFiniteAutomaton = function() {
		var tree = self.toDeSimoneTree();
		var automaton = new FiniteAutomaton();
		// TODO
		return automaton;
	};

	// Checks if this regex is equivalent to another one.
	this.isEquivalentTo = function(other) {
		if (other instanceof Regex) {
			// TODO
		}
		return false;
	};
};

new Regex("**").toDeSimoneTree();

})();