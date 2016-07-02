(function() {
"use strict";

var EPSILON = Utilities.EPSILON;

window.CFG = function(cfgStr) {
	var self = this;
	this.productions = {};
	this.initialProduction = null;

	/*
	Receives a string representation of a group of productions
	involving one non-terminal and returns an object representing
	them or null if they're not valid.
	Example:
		Input: "S -> a S b | id | &"
		Output: {
			S: [["a", "S", "b"], ["id"], ["&"]]
		}
	*/
	var stringToProduction = function(str) {
		var map = {};
		var explodedStr = str.split(' ');
		var dividedStr = explodedStr.split('->');
		var initialSymbol = dividedStr[0][0];
		var productions = dividedStr[1].split('|');
		map[initialSymbol] = productions;
		return map;
	};

	var productionIteration = function(callback) {
		for (var name in self.productions) {
			if (self.productions.hasOwnProperty(name)) {
				for (var i = 0; i < self.productions[name].length; i++) {
					callback(name, self.productions[name][i]);
				}
			}
		}
	};

	// Receives a string representation of a group of productions
	// involving one non-terminal and adds all of them to this CFG.
	this.addProductions = function(str) {
		var productions = stringToProduction(str);
		if (!productions) {
			return false;
		}
		for (var name in productions) {
			if (productions.hasOwnProperty(name)) {
				for (var i = 0; i < productions[name].length; i++) {
					self.addProduction(name, productions[name][i]);
				}
			}
		}
		return true;
	};

	// Receives the informations about a production and adds it
	// to this CFG.
	this.addProduction = function(name, symbolSequence) {
		if (!self.productions.hasOwnProperty(name)) {
			self.productions[name] = [];
		}
		self.productions[name].push(symbolSequence);
	};

	// Receives the informations about a production and removes it
	// from this CFG.
	this.removeProduction = function(name, symbolSequence) {
		if (!self.productions.hasOwnProperty(name)) {
			return;
		}
		var index = Utilities.indexOf(self.productions[name], symbolSequence);
		if (index >= 0) {
			self.productions[name].splice(index, 1);
		}
	};

	this.getNonTerminals = function() {
		return Object.keys(self.productions);
	};

	this.getTerminals = function() {
		var result = [];
		productionIteration(function(name, production) {
			for (var i = 0; i < production.length; i++) {
				var symbol = production[i];
				if (Utilities.isTerminal(symbol)) {
					result.push(symbol);
				}
			}
		});
		Utilities.removeDuplicates(result);
		return result;
	};

	/*
	Returns an object containing:
	- hasLeftRecursion: true if this grammar has a left recursion, false otherwise;
	- hasDirectRecursion: true if the left recursion is direct, false otherwise;
	- recursiveNonTerminals: an array containing all recursive non-terminals.
	*/
	this.getRecursionInformation = function() {
		return {
			hasLeftRecursion: false,
			hasDirectRecursion: false,
			recursiveNonTerminals: []
		};
	};

	/*
	Returns an object containing:
	- isFactored: true if this grammar is factored, false otherwise;
	- hasDirectNonFactorization: true if this grammar has a direct
	  non-factorization, false otherwise;
	- nonFactoredNonTerminals: an array containing all non-factored non-terminals.
	*/
	this.getFactorizationInformation = function() {
		return {
			isFactored: true,
			hasDirectNonFactorization: false,
			nonFactoredNonTerminals: []
		};
	};

	function populateFirst(container, nonTerminal) {
		if (!container.hasOwnProperty(nonTerminal)) {
			container[nonTerminal] = [];
		} else {
			return;
		}

		var productions = self.productions[nonTerminal];
		for (var i = 0; i < productions.length; i++) {
			var production = productions[i];
			if (Utilities.isTerminal(production[0]) || production[0] == EPSILON) {
				container[nonTerminal].push(production[0]);
				continue;
			}

			var j = 0;
			while (j < production.length) {
				if (Utilities.isTerminal(production[j])) {
					container[nonTerminal].push(production[j]);
					break;
				}

				populateFirst(container, production[j]);
				var hasEpsilon = false;
				var first = container[production[j]];
				var length = first.length;
				for (var k = 0; k < length; k++) {
					if (first[k] == EPSILON) {
						hasEpsilon = true;
					} else {
						container[nonTerminal].push(first[k]);
					}
				}

				if (!hasEpsilon) {
					break;
				}
				j++;
			}

			if (j == production.length) {
				container[nonTerminal].push(EPSILON);
			}
		}
	}

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding first array.
	this.first = function() {
		var result = {};
		var nonTerminals = self.getNonTerminals();
		for (var i = 0; i < nonTerminals.length; i++) {			
			populateFirst(result, nonTerminals[i]);
		}

		for (var i = 0; i < nonTerminals.length; i++) {
			Utilities.removeDuplicates(result[nonTerminals[i]]);
		}
		return result;
	};

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding follow array.
	this.follow = function() {
		// TODO
		return {};
	};

	var lines = cfgStr.split("\n");
	for (var i = 0; i < lines.length; i++) {
		if (!self.addProductions(lines[i])) {
			throw Utilities.ERROR_INVALID_GRAMMAR;
		}
	}
};

})();
