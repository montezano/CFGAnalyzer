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
 * [expression, expectedRoot, inOrderLeaves, inOrderTerminalThreadingLinks]
 */
var deSimoneTreeTestCases = [
	["(0|10*10*1)+", "+", [0,1,0,1,0,1], ["|",".","*",".","*","+"]],
	["a*b+c", ".", ["a","b","c"], ["*","+",null]],
	["abc", ".", ["a","b","c"], [".",".",null]],
	["(ab|bc)?(abc)*", ".", ["a","b","b","c","a","b","c"], [".","|",".","?",".",".","*"]],
	["(a|b)(c|d)|(a|c)(b|d)", "|", ["a","b","c","d","a","c","b","d"], ["|",".","|","|","|",".","|",null]],
	["ab", ".", ["a","b"], [".",null]]
];

/* Structure:
 * [expression, input, shouldAccept]
 */
var automatonTestCases = [
	["ab*c", "ac", true],
	["ab*c", "abbbbbbbbc", true],
	["ab*c", "abbbb", false],
	["ab*c", "bbbc", false],
	["ab*c", "", false],
	["0(0|1)*0|1(0|1)*1", "01010101", false],
	["0(0|1)*0|1(0|1)*1", "01010100", true],
	["0(0|1)*0|1(0|1)*1", "111001000", false],
	["0(0|1)*0|1(0|1)*1", "111001001", true],
	["(0|1(01*0)*1)+", "", false],
	["(0|1(01*0)*1)+", "000", true],
	["(0|1(01*0)*1)+", "101111001101011", true],
	["a*", "", true],
	["a*", "a", true],
	["a*", "aaaaaa", true]
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

function printSimpleTest(testName, passed) {
	var output = testName + ": ";
	output += passed ? "OK" : "NOT OK";
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
		for (var i = 0; i < testCases.length; i++) {
			var test = testCases[i];
			var regex = new Regex(test[0]);
			var instance = regex.toDeSimoneTree();

			var ok = (instance.root().data == test[1]);
			var leaves = instance.getLeafNodes();
			for (var j = 0; j < leaves.length; j++) {
				ok = ok && (leaves[j].data == test[2][j]);
				if (leaves[j].threadingLink) {
					ok = ok && (leaves[j].threadingLink.data == test[3][j]);
				} else {
					ok = ok && !test[3][j];
				}
			}
			printSimpleTest(test[0], ok);
		}
	},
	testAutomaton: function() {
		var testCases = automatonTestCases;
		for (var i = 0; i < testCases.length; i++) {
			var test = testCases[i];
			var regex = new Regex(test[0]);
			var instance = regex.toFiniteAutomaton();
			instance.read(test[1]);
			printTest(test[0], test[2], instance.accepts());
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