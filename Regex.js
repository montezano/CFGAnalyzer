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
		var root = new Node();
		// TODO
		return root;
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

})();