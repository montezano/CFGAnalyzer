(function() {
"use strict";

var cfgValidTestCases = [
	"S -> a S b | &",
	"E -> T E1\nE1 -> + T E1 | &\nT -> F T1\nT1 -> * F T1 | &\nF -> ( E ) | id",
	"S -> A b | &\nA -> c",
	"S -> A B C\nA -> a A | &\nB -> b B | A C d\nC -> c C | &",
	"S123 -> b",
	"S736473843463743764734 -> &",
	"S -> I am a grammar like it or not",
	"C -> if expr then C | if expr then C else C | cmd ; C | cmd",
	"S -> a -> b"
];

var cfgInvalidTestCases = [
	"S a S b &",
	"S >- a S b | &",
	"S-> a S b | &",
	"x -> a S b | &",
	"SA -> a S b | &",
	"S' -> a S b | &",
	"Sx -> a S b | &",
	"S -> a | | b",
	"S -> SA",
	"S -> S'",
	"S -> Sx",
	"CH4 + 2O2 -> CO2 + 2H2O",
	"I am not a grammar",
	"JS is cool",
	"Writing invalid test cases is fun",
	"-> a S c",
	"S ->",
	"S -> ",
	"S - -> a"
];

window.Test = {
	exec: function() {
		var instance;
		var success = 0;

		console.log("Valid Test Cases");
		for (var i = 0; i < cfgValidTestCases.length; i++) {
			var expr = cfgValidTestCases[i];
			try {
				instance = new CFG(expr);
				console.log("#" + i + " - OK");
				success++;
			} catch (e) {
				console.log("#" + i + " - NOT OK");
			}
		}

		console.log("");
		console.log("Invalid Test Cases");
		for (var i = 0; i < cfgInvalidTestCases.length; i++) {
			var expr = cfgInvalidTestCases[i];
			try {
				instance = new CFG(expr);
				console.log("#" + i + " - NOT OK");
			} catch (e) {
				console.log("#" + i + " - OK");
				success++;
			}
		}

		var totalCases = cfgValidTestCases.length + cfgInvalidTestCases.length;
		console.log("#####################");
		console.log(success + " OK");
		console.log((totalCases - success) + " NOT OK");
	}
};

})();
