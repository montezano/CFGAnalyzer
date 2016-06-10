(function(){
"use strict";

window.Utilities = {
	// A list of valid terminal terms (it's filled in the loops below)
	alphabet: ["&"],

	// Structure:
	// "operator": [number of operands, priority]
	operatorInfo: {
		"?": [1, 3],
		"*": [1, 3],
		"+": [1, 3],
		"|": [2, 1],
		".": [2, 2]
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