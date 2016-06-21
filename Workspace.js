(function() {
"use strict";

var ERROR_INVALID_REGEX = "Invalid regular expression";
var ERROR_INVALID_OPERATION = "Invalid operation";
var NO_TRANSITION = "-";
var INITIAL_STATE = "->";
var ACCEPTING_STATE = "*";

var $ = Utilities.$;
var container = function() {
	return $("#main");
};

var buttonBar = function() {
	return $("#button_bar");
};

var regexList = function() {
	return $("#regex_list");
};

var minimizeButton = function() {
	return $("#minimize_btn");
};

var intersectionButton = function() {
	return $("#intersect_btn");
};

var equivalenceButton = function() {
	return $("#equivalence_btn");
};

var node = function(tag) {
	return document.createElement(tag);
};

var genAutomatonID = function(id) {
	return "aut" + id;
};

var genRegexID = function(id) {
	return "regex" + id;
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

	// Returns a list containing all checked expressions.
	function getCheckedExpressions() {
		var checkboxes = regexList().querySelectorAll("input[type='checkbox']");
		var expressions = [];
		for (var i = 0; i < checkboxes.length; i++) {
			if (checkboxes[i].checked) {
				var id = checkboxes[i].parentElement.parentElement.id;
				id = id.replace("regex", "");
				expressions.push(self.expressionList[id]);
			}
		}
		return expressions;
	}

	// shows/hides the intersection button when appropriate
	function updateUI() {
		var checked = getCheckedExpressions();
		var numChecked = checked.length;
		minimizeButton().style.display = (numChecked == 1) ? "block" : "none";
		intersectionButton().style.display = (numChecked == 2) ? "block" : "none";
		equivalenceButton().style.display = (numChecked == 2) ? "block" : "none";
	}

	// Returns a list item containing a given expression.
	function regexListItem(obj) {
		var row = node("tr");
		row.id = genRegexID(obj.id);

		var regexCell = node("td");
		regexCell.innerHTML = obj.regex.string;
		row.appendChild(regexCell);

		var checkboxCell = node("td");
		var checkbox = node("input");
		checkbox.type = "checkbox";
		checkbox.addEventListener("change", updateUI);

		checkboxCell.appendChild(checkbox);
		row.appendChild(checkboxCell);
		return row;
	}

	// Adds an already-constructed object to this workspace.
	function addObject(obj) {
		self.expressionList.push(obj);
		self.update(obj);
	}

	// Initializes event handlers
	this.initEvents = function() {
		updateUI();
		minimizeButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 1) {
				self.error(ERROR_INVALID_OPERATION);
			}
			var expr = expressions[0];
			var clone = buildExprObject(expr.regex);
			clone.regex.string = "[MIN] " + clone.regex.string;
			clone.automaton = clone.automaton.minimize();
			addObject(clone);
		});

		intersectionButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
			}
			console.log(expressions);
			window.a1 = expressions[0].automaton;
			window.a2 = expressions[1].automaton;
			alert("Not yet implemented.");
		});

		equivalenceButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
			}
			console.log(expressions);
			window.a1 = expressions[0].automaton;
			window.a2 = expressions[1].automaton;
			alert("Not yet implemented.");
		});
	};

	// Shows an error to the user.
	this.error = function(message) {
		alert(message);
	};

	// Adds a new regex to this workspace.
	this.addRegex = function(regex) {
		var instance = new Regex(regex);
		if (!instance.isValid()) {
			self.error(ERROR_INVALID_REGEX);
			return false;
		}
		var obj;
		try {
			obj = buildExprObject(instance);
		} catch (e) {
			alert("[BUG] isValid() returned true for: " + regex);
			return false;
		}
		addObject(obj);
		return true;
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

		var regexNode = $("#" + genRegexID(obj.id));
		if (!regexNode) {
			regexList().appendChild(regexListItem(obj));
		}
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
