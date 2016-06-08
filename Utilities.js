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

	// Shortcut functions
	numOperands: function(operator) {
		return Utilities.operatorInfo[operator][0];
	},

	priority: function(operator) {
		return Utilities.operatorInfo[operator][1];
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