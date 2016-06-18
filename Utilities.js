(function(){
"use strict";

var LEFT = 1;
var RIGHT = 2;
var NEXT = 3;

window.Utilities = {
	// A list of valid terminal terms (it's filled in the loops below)
	alphabet: ["&"],

	// De Simone traversal commands
	VISIT_LEFT: LEFT,
	VISIT_RIGHT: RIGHT,
	VISIT_NEXT: NEXT,

	// The standard error message.
	INVALID_REGEX: "Error: Invalid regular expression",

	/* Structure:
	 * "operator": [number of operands,
	 *				priority,
	 *				[descending commands],
	 *				[ascending commands]]
	 */
	operatorInfo: {
		"?": [1, 3, [LEFT, NEXT], [NEXT]],
		"*": [1, 3, [LEFT, NEXT], [LEFT, NEXT]],
		"+": [1, 3, [LEFT], [LEFT, NEXT]],
		"|": [2, 1, [LEFT, RIGHT], [NEXT]],
		".": [2, 2, [LEFT], [RIGHT]]
	},

	// A list containing only the operator symbols (filled below)
	operators: null,

	// Returns the number of operands of an operator.
	numOperands: function(operator) {
		return Utilities.operatorInfo[operator][0];
	},

	// Returns the priority of an operator.
	priority: function(operator) {
		return Utilities.operatorInfo[operator][1];
	},

	// Generates a name for the (n+1)-th state of an automaton.
	generateStateName: function(n) {
		var name = String.fromCharCode(65 + (n % 26));
		var numApostrophes = Math.floor(n / 26);
		for (var i = 0; i < numApostrophes; i++) {
			name += "'";
		}
		return name;
	},

	// Removes all duplicated elements of a numeric array.
	removeDuplicates: function(array) {
		array.sort();
		for (var i = 0; i < array.length; i++) {
			if (array[i] == array[i + 1]) {
				array.splice(i + 1, 1);
			}
		}
	},

	// Checks if two arrays are equal.
	isSameArray: function(arr1, arr2) {
		if (arr1.length != arr2.length) return false;
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] != arr2[i]) {
				return false;
			}
		}
		return true;
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
	Utilities.alphabet.push(String.fromCharCode(code).toLowerCase());
}

// Adds all digits to the terminal list
for (var i = 0; i < 10; i++) {
	Utilities.alphabet.push(i + "");
}

Utilities.operators = Object.keys(Utilities.operatorInfo);

})();