(function(){
"use strict";

window.Utilities = {
	// A list of valid non-terminal terms (it's filled in the loop below)
	nonTerminals: [],

	// Special symbols
	EPSILON: "&",
	DOLLAR: "$",
	TRANSITION_SYMBOL: "➞",
	NO_TRANSITION: "—",

	// Error messages
	ERROR_INVALID_GRAMMAR: "Invalid grammar",
	ERROR_INVALID_PRODUCTION: "Invalid production",
	ERROR_NOT_LL1: "The grammar is not LL(1)",

	// Labels
	RECURSION_TYPES: {
		0: "None",
		1: "<span class='notOK'>Direct</span>",
		2: "<span class='notOK'>Indirect</span>"
	},

	FACTORIZATION_TYPES: {
		0: "Factored",
		1: "<span class='notOK'>Direct</span>",
		2: "<span class='notOK'>Indirect</span>"
	},

	SIMULATION_STATUS: {
		0: "<span class='notOK'>Rejected</span>",
		1: "<span class='ok'>Accepted</span>"
	},

	isNonTerminal: function(symbol) {
		return Utilities.nonTerminals.includes(symbol[0]) && !isNaN(symbol.slice(1));
	},

	isTerminal: function(symbol) {
		return !Utilities.isNonTerminal(symbol) && symbol != Utilities.EPSILON;
	},

	// Removes all duplicated elements of a numeric array.
	removeDuplicates: function(array) {
		array.sort();
		for (var i = 0; i < array.length; i++) {
			if (array[i] == array[i + 1]) {
				array.splice(i + 1, 1);
				i--;
			}
		}
	},

	// Removes all duplicated elements of a indexable array.
	removeIndexableDuplicates: function(array) {
		array.sort();
		array.reverse();
		var map = {};
		while (array.length > 0) {
			map[array.pop()] = 1;
		}

		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				array.push(key);
			}
		}
	},

	// Returns the union of two arrays.
	union: function(arr1, arr2) {
		var result = arr1.concat(arr2);
		Utilities.removeDuplicates(result);
		return result;
	},

	// Returns the intersection of two arrays.
	intersection: function(arr1, arr2) {
		var result = [];
		for (var i = 0; i < arr1.length; i++) {
			if (arr2.includes(arr1[i])) {
				result.push(arr1[i]);
			}
		}
		return result;
	},

	// Returns the difference arr1 - arr2
	subtract: function(arr1, arr2) {
		var result = [];
		for (var i = 0; i < arr1.length; i++) {
			if (!arr2.includes(arr1[i])) {
				result.push(arr1[i]);
			}
		}
		return result;
	},

	// Returns the position of the container where element is;
	// Returns -1 if not found. Also works if element is an array.
	indexOf: function(container, element) {
		if (!(element instanceof Array)) {
			return container.indexOf(element);
		}
		for (var i = 0; i < container.length; i++) {
			if (container[i] instanceof Array && container[i].length == element.length) {
				var equal = true;
				for (var j = 0; j < container[i].length; j++) {
					if (container[i][j] != element[j]) {
						equal = false;
						break;
					}
				}
				if (equal) {
					return i;
				}
			}
		}
		return -1;
	},

	// Retrieves one or more nodes of the DOM according to a CSS selector.
	$: function(selector) {
		if (selector[0] == '#') {
			return document.querySelector(selector);
		}
		return document.querySelectorAll(selector);
	}
};

// Adds all lowercase letters to the terminal list
for (var code = 65; code < 65 + 26; code++) {
	Utilities.nonTerminals.push(String.fromCharCode(code).toUpperCase());
}

})();