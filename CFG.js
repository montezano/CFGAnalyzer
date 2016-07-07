(function() {
"use strict";

var DOLLAR = Utilities.DOLLAR;
var EPSILON = Utilities.EPSILON;

window.CFG = function(cfgStr) {
	var self = this;
	this.string = cfgStr;
	this.productions = {};
	this.initialSymbol = null;
	this.firstData = null;

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
	function stringToProduction(str) {
		var map = {};
		var explodedStr = str.split(' ');

		if (!explodedStr.includes("->")) return null;

		var dividedStr = explodedStr.split('->');
		var initialSymbol = dividedStr[0][0];

		if (!validateNonTerminal(initialSymbol)) return null;

		var productions = dividedStr[1].split('|');

		for (var i = 0; i < productions.length; i++) {
			if (productions[i].length < 1) {
				return null;
			} else {
				// There's at least one production
				for (var k = 0; k < productions[i].length; k++) {
					if (productions[i][k] != productions[i][k].toLowerCase()) {
						if (!validateNonTerminal(productions[i][k])) {
							return null;
						}
					}
				}
			}
		}

		map[initialSymbol] = productions;
		return map;
	};

	function validateNonTerminal(symbol) {
		if (symbol[0] < 'A' || symbol[0] > 'Z') return false;
		for (var i = 1; i < symbol.length; i++) {
			if (symbol[i] < '0' || symbol[i] > '9') return false;
		}
		return true;
	}

	// An utility function used to iterate over all productions of this CFG,
	// executing a callback function on each one providing their name and list
	// of produced symbols.
	function productionIteration(callback) {
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
		if (!self.initialSymbol) {
			self.initialSymbol = name;
		}
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

	// Returns a list containing all non-terminals of this CFG.
	this.getNonTerminals = function() {
		return Object.keys(self.productions);
	};

	// Returns a list containing all terminals of this CFG.
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

	// Returns a map associating each non-terminal of this grammar with a list
	// of all non-terminals that it reaches as the first symbol of its productions.
	function getLeftRangeTable() {
		var rangeTable = {};
		productionIteration(function(name, production) {
			if (!rangeTable.hasOwnProperty(name)) {
				rangeTable[name] = [];
			}

			if (Utilities.isNonTerminal(production[0])) {
				rangeTable[name].push(production[0]);
			}
		});

		var stable = false;
		while (!stable) {
			stable = true;
			for (var name in rangeTable) {
				if (!rangeTable.hasOwnProperty(name)) continue;
				var length = rangeTable[name].length;
				for (var i = 0; i < length; i++) {
					var nonTerminal = rangeTable[name][i];
					rangeTable[name] = rangeTable[name].concat(rangeTable[nonTerminal]);
				}
				Utilities.removeDuplicates(rangeTable[name]);
				if (rangeTable[name].length != length) {
					stable = false;
				}
			}
		}
		return rangeTable;
	}

	/*
	Returns an object containing:
	- hasLeftRecursion: true if this grammar has a left recursion, false otherwise;
	- recursiveNonTerminals: a map associating each recursive non-terminal of
	  this grammar with the type of recursion it has (true for direct, false
	  for indirect)
	*/
	this.getRecursionInformation = function() {
		var DIRECT = true;
		var INDIRECT = false;
		var result = {
			hasLeftRecursion: false,
			recursiveNonTerminals: {}
		};
		productionIteration(function(name, production) {
			if (production[0] == name) {
				result.hasLeftRecursion = true;
				result.recursiveNonTerminals[name] = DIRECT;
			}
		});

		var rangeTable = getLeftRangeTable();
		for (var name in rangeTable) {
			if (rangeTable.hasOwnProperty(name)
				&& rangeTable[name].includes(name)
				&& !result.recursiveNonTerminals.hasOwnProperty(name)) {
				result.hasLeftRecursion = true;
				result.recursiveNonTerminals[name] = INDIRECT;
			}
		}
		return result;
	};

	/*
	Returns an object containing:
	- isFactored: true if this grammar is factored, false otherwise;
	- nonFactoredNonTerminals: a map associating each non-factored non-terminal
	  of this grammar with the type of non-factorization it has (true for direct,
	  false for indirect)
	*/
	this.getFactorizationInformation = function() {
		var DIRECT = true;
		var INDIRECT = false;
		var result = {
			isFactored: true,
			nonFactoredNonTerminals: {}
		};
		var firstTable = {};
		var directFirstTable = {};
		self.firstData = self.first();
		productionIteration(function(name, production) {
			if (!firstTable.hasOwnProperty(name)) {
				firstTable[name] = {};
			}

			if (!directFirstTable.hasOwnProperty(name)) {
				directFirstTable[name] = {};
			}

			if (directFirstTable[name].hasOwnProperty(production[0])) {
				result.isFactored = false;
				result.nonFactoredNonTerminals[name] = DIRECT;
			} else {
				directFirstTable[name][production[0]] = 1;
			}

			var first = compositeFirst(production);
			for (var i = 0; i < first.length; i++) {
				if (!result.nonFactoredNonTerminals.hasOwnProperty(name)
					&& firstTable[name].hasOwnProperty(first[i])) {
					result.isFactored = false;
					result.nonFactoredNonTerminals[name] = INDIRECT;
					break;
				}
				firstTable[name][first[i]] = 1;
			}
		});
		return result;
	};

	// Pushes all non-epsilon symbols of a list to another list and returns
	// true if an epsilon has been found, false otherwise.
	function pushNonEpsilons(origin, destination) {
		var hasEpsilon = false;
		var length = origin.length;
		for (var i = 0; i < length; i++) {
			if (origin[i] == EPSILON) {
				hasEpsilon = true;
			} else {
				destination.push(origin[i]);
			}
		}
		return hasEpsilon;
	}

	// Populates a map with the first set of a given non-terminal and all
	// other non-terminals it depends on.
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
				var first = container[production[j]];
				var hasEpsilon = pushNonEpsilons(first, container[nonTerminal]);
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

	// Returns the first set of a sequence of symbols, given that the first
	// set of all non-terminals are available in self.firstData.
	function compositeFirst(symbolSequence) {
		var result = [];
		if (symbolSequence.length == 0
			|| (symbolSequence.length == 1 && symbolSequence[0] == EPSILON)) {
			result.push(EPSILON);
			return result;
		}

		var shouldPushEpsilon = true;
		for (var i = 0; i < symbolSequence.length; i++) {
			var symbol = symbolSequence[i];
			if (Utilities.isTerminal(symbol)) {
				result.push(symbol);
				shouldPushEpsilon = false;
				break;
			}

			var first = self.firstData[symbol];
			var hasEpsilon = pushNonEpsilons(first, result);
			if (!hasEpsilon) {
				shouldPushEpsilon = false;
				break;
			}
		}

		Utilities.removeDuplicates(result);
		if (shouldPushEpsilon) {
			result.push(EPSILON);
		}
		return result;
	}

	// Populates a map with the preliminary follow set of non-terminals
	// used in a given production.
	function populateFollow(container, nonTerminal, production) {
		for (var i = 0; i < production.length; i++) {
			var symbol = production[i];
			if (Utilities.isNonTerminal(symbol)) {
				var remaining = production.slice(i + 1);
				var first = compositeFirst(remaining);
				var hasEpsilon = pushNonEpsilons(first, container[symbol]);
				if (hasEpsilon) {
					container[symbol] = container[symbol].concat(container[nonTerminal]);
				}
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
		var result = {};
		var nonTerminals = self.getNonTerminals();
		for (var i = 0; i < nonTerminals.length; i++) {
			result[nonTerminals[i]] = [];
			if (self.initialSymbol == nonTerminals[i]) {
				result[nonTerminals[i]].push(DOLLAR);
			}
		}

		self.firstData = self.first();
		var prevFollow = "", currFollow = "{}";
		while (prevFollow != currFollow) {
			prevFollow = currFollow;
			productionIteration(function(name, production) {
				populateFollow(result, name, production);
			});

			for (var i = 0; i < nonTerminals.length; i++) {
				Utilities.removeDuplicates(result[nonTerminals[i]]);
			}
			currFollow = JSON.stringify(result);
		}
		return result;
	};

	var lines = cfgStr.split("\n");
	for (var i = 0; i < lines.length; i++) {
		if (!self.addProductions(lines[i])) {
			throw Utilities.ERROR_INVALID_GRAMMAR;
		}
	}
};

})();
