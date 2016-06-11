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
}

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
	function printableAutomaton(automaton) {
		if (automaton instanceof FiniteAutomaton) {
			var transitions = automaton.transitions;
			var alphabet = [];
			for (var state in transitions) {
				if (transitions.hasOwnProperty(state)) {
					for (var i in transitions[state]) {
						if (transitions[state].hasOwnProperty(i)) {
							if (!alphabet.includes(i)) {
								alphabet.push(i);
							}
						}
					}
				}
			}
			alphabet.sort();

			var table = node("table");
			table.classList.add("automaton");
			var header = node("tr");
			var emptyNode = node("td");
			emptyNode.classList.add("emptyCell");
			header.appendChild(emptyNode);
			var row, cell;
			for (var i = 0; i < alphabet.length; i++) {
				cell = node("td");
				cell.innerHTML = alphabet[i];
				header.appendChild(cell);
			}
			table.appendChild(header);

			for (var state in transitions) {
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
				for (var i = 0; i < alphabet.length; i++) {
					var content = NO_TRANSITION;
					if (transitions[state].hasOwnProperty(alphabet[i])) {
						content = transitions[state][alphabet[i]];
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

		var automatonNode = $("#aut" + obj.id);
		if (!automatonNode && obj.visible) {
			container().appendChild(printableAutomaton(obj.automaton));
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
