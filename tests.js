(function(){
"use strict";

var isValidTestCases = {
	"a": true,
	"9": true,
	"&": true,
	"a(": false,
	"a)": false,
	"a.": false,
	"a|": false,
	"a(b|c)": true,
	"a.|b": false,
	"a??": false,
	"(a|b)+(c|d)*e": true,
	"(ab|ac)*a?|(ba?c)*": true
};

var normalizeTestCases = {
	"abc": "a.b.c",
	"abc|cde": "a.b.c|c.d.e",
	"(a|b)(c|d)": "(a|b).(c|d)",
	"(ab|bc)?(abc)*": "(a.b|b.c)?.(a.b.c)*",
	"(0|10*10*1)+": "(0|1.0*.1.0*.1)+"
};

/* Structure:
 * [regex, expectedRoot, inOrderLeaves, inOrderTerminalThreadingLinks]
 */
var deSimoneTreeTestCases = [
	["(0|10*10*1)+", "+", [0,1,0,1,0,1], ["|",".","*",".","*","+"]],
	["a*b+c", ".", ["a","b","c"], ["*","+",null]],
	["abc", ".", ["a","b","c"], [".",".",null]],
	["(ab|bc)?(abc)*", ".", ["a","b","b","c","a","b","c"], [".","|",".","?",".",".","*"]],
	["(a|b)(c|d)|(a|c)(b|d)", "|", ["a","b","c","d","a","c","b","d"], ["|",".","|","|","|",".","|",null]],
	["ab", ".", ["a","b"], [".",null]]
];

function printTest(testName, expected, actual) {
	var output = testName + ": ";
	if (expected == actual) {
		output += "OK";
	} else {
		output += "NOT OK (expected \"" + expected + "\", got \"" + actual + "\")";
	}
	console.log(output);
}

window.Test = {
	methodTest: function(methodName, testCases) {
		var instance;
		for (var i in testCases) {
			if (testCases.hasOwnProperty(i)) {
				instance = new Regex(i);
				printTest(i, testCases[i], instance[methodName]());
			}
		}
	},
	testValidity: function() {
		this.methodTest("isValid", isValidTestCases);
	},
	testNormalization: function() {
		this.methodTest("normalize", normalizeTestCases);
	},
	testDeSimoneTree: function() {
		var testCases = deSimoneTreeTestCases;
		var instance;
		for (var i = 0; i < testCases.length; i++) {
			var test = testCases[i];
			instance = new Regex(test[0]);

			var ok = (instance.root().data == test[1]);
			var leaves = instance.getLeafNodes();
			// TODO			
		}
	},
	exec: function() {
		var header = false;
		for (var i in this) {
			if (this.hasOwnProperty(i) && i.startsWith("test")) {
				if (header) {
					console.log("--------------------");
				}
				header = true;
				console.log(i + "():");
				this[i]();
			}
		}
	}
};

})();