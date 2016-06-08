(function(){
"use strict";

var normalizeTestCases = {
	"abc": "a.b.c",
	"abc|cde": "a.b.c|c.d.e",
	"(a|b)(c|d)": "(a|b).(c|d)",
	"(ab|bc)?(abc)*": "(a.b|b.c)?.(a.b.c)*",
	"(0|10*10*1)+": "(0|1.0*.1.0*.1)+"
};

var assertEquals = function(expected, actual) {
	if (actual != expected) {
		throw new Error("Assertion failed: expected \"" + expected + "\", got \"" + actual + "\".");
	}
};

window.Test = {
	testNormalization: function() {
		var instance;
		for (var i in normalizeTestCases) {
			if (normalizeTestCases.hasOwnProperty(i)) {
				instance = new Regex(i);
				assertEquals(normalizeTestCases[i], instance.normalize());
			}
		}
	},
	exec: function() {
		for (var i in this) {
			if (this.hasOwnProperty(i) && i.startsWith("test")) {
				this[i]();
			}
		}
	}
};

})();