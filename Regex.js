(function(){
"use strict";

window.Regex = function(str) {
	var self = this;
	this.string = str.toString();

	// Adds concatenation wherever it's implicit. Returns the new regex.
	function normalize() {
		var noDot = true;
		var normalizedStr = "";
		var specialModifier = "?*+)|";
		for (var i = 0; i < str.length; i++) {
			if (str[i] == '.') continue;
			if (!specialModifier.includes(str[i]) && !noDot) {
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
			if (regex[i] == ')') {
				var subtree = treeList.pop();
				subtree.changePriority(10);
				treeList[treeList.length - 1].push(subtree);

				// treeList[treeList.length - 1].debug();
				// console.log("--------------");
				continue;
			}
			var tree = treeList[treeList.length - 1];
			tree.push(regex[i]);
			treeList[treeList.length - 1] = tree.root();

			// treeList[treeList.length - 1].debug();
			// console.log("--------------");
		}
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

new Regex("a?(bc)?").toDeSimoneTree();

})();