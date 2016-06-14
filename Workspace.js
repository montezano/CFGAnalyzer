(function() {
"use strict";

var ERROR_INVALID_REGEX = "Invalid regular expression";
var NO_TRANSITION = "-";
var INITIAL_STATE = "->";
var ACCEPTING_STATE = "*";

var $ = Utilities.$;
var container = function() {
	return $("#main");
};

var node = function(tag) {
	return document.createElement(tag);
};

var genAutomatonID = function(id) {
	return "aut" + id;
};

window.Workspace = function() {
	var self = this;
	this.expressionList = [];

	function buildExprObject(regex) {
		return {
			id: self.expressionList.length,
			regex: regex,
			automaton: regex.toFiniteAutomaton(),
			visible: true
		};
	}

	// Produces an HTML version of an automaton.
	function printableAutomaton(obj) {
		var regex = obj.regex;
		var automaton = obj.automaton;
		if (automaton instanceof FiniteAutomaton) {
			var table = node("table");
			table.classList.add("automaton");
			table.id = genAutomatonID(obj.id);

			var alphabet = automaton.getAlphabet();
			var header = node("tr");
			var cell = node("td");
			cell.colSpan = alphabet.length + 1;
			cell.innerHTML = regex.string;
			header.appendChild(cell);
			table.appendChild(header);

			header = node("tr");
			cell = node("td");
			cell.classList.add("emptyCell");
			header.appendChild(cell);

			for (var i = 0; i < alphabet.length; i++) {
				cell = node("td");
				cell.innerHTML = alphabet[i];
				header.appendChild(cell);
			}
			table.appendChild(header);

			var row;
			var transitions = automaton.transitions;
			for (var i = 0; i < automaton.stateList.length; i++) {
				var state = automaton.stateList[i];
				row = node("tr");
				cell = node("td");
				var printableState = state;
				if (automaton.acceptingStates.includes(state)) {
					printableState = ACCEPTING_STATE + printableState;
				}
				if (automaton.initialState == state) {
					printableState = INITIAL_STATE + printableState;
				}
				cell.innerHTML = printableState;
				row.appendChild(cell);
				for (var j = 0; j < alphabet.length; j++) {
					var content = NO_TRANSITION;
					if (transitions.hasOwnProperty(state)
						&& transitions[state].hasOwnProperty(alphabet[j])) {
						content = transitions[state][alphabet[j]];
					}
					cell = node("td");
					cell.innerHTML = content;
					row.appendChild(cell);
				}
				table.appendChild(row);
			}

			return table;
		}
		return null;
	}

	// Adds a new regex to this workspace.
	this.addRegex = function(regex) {
		var instance = new Regex(regex);
		if (!instance.isValid()) {
			self.error(ERROR_INVALID_REGEX);
			return;
		}
		var obj = buildExprObject(instance);
		self.expressionList.push(obj);
		self.update(obj);
	};

	// Updates the view.
	this.update = function(obj) {
		if (obj == null) {
			for (var i = 0; i < self.expressionList.length; i++) {
				self.update(self.expressionList[i]);
			}
			return;
		}

		var automatonNode = $("#" + genAutomatonID(obj.id));
		if (!automatonNode && obj.visible) {
			container().appendChild(printableAutomaton(obj));
		} else if (automatonNode && !obj.visible) {
			automatonNode.parentElement.removeChild(automatonNode);
		}
		// container().innerHTML += obj.regex.string + "<br>";
	};

	// Returns a string representation of this workspace, which can be
	// saved to a text file and later recovered via Workspace.load().
	this.toString = function() {
		var str = "";
		// TODO
		return str;
	};
};

// Receives the content of a file and loads a Workspace instance.
Workspace.load = function(fileContent) {
	var result = new Workspace();
	// TODO
	console.log(fileContent);
	return result;
};

})();
