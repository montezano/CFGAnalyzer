(function() {
"use strict";

var EPSILON = "&";

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
	this.stringToProduction = function(str) {
		map = {};
		explodedStr = str.split(' ');
		dividedStr = explodedStr.split('->');
		initialSymbol = dividedStr[0][0];
		productions = dividedStr[1].split('|');
		map[initialSymbol] = productions;
		return map;
	};

	// Receives a string representation of a group of productions
	// involving one non-terminal and adds all of them to this CFG.
	this.addProductions = function(str) {
		var productions = self.stringToProduction(str);
		if (!productions) {
			return false;
		}
		for (var name in productions) {
			if (productions.hasOwnProperty(name)) {
				self.addProduction(name, productions[name]);
			}
		}
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

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding first array.
	this.first = function() {
		// TODO
		return {};
	};

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding follow array.
	this.follow = function() {
		// TODO
		return {};
	};
};

})();
