(function() {
"use strict";

var ERROR_INVALID_REGEX = "Invalid regular expression";
var ERROR_INVALID_OPERATION = "Invalid operation";
var ERROR_ALREADY_MINIMIZED = "The selected expression is already minimized";
var NO_TRANSITION = "—";
var INITIAL_STATE = "➞";
var ACCEPTING_STATE = "⚹";
var MINIMIZED_PREFIX = "[MIN]";

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

var deleteButton = function() {
	return $("#delete_btn");
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
	var nextID = 0;
	this.expressionList = {};

	// Returns an object containing a regex, its corresponding
	// automaton and an ID.
	// TODO: visible seemed nice at first but is probably useless
	function buildExprObject(regex) {
		return {
			id: nextID++,
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
			// cell.classList.add("emptyCell");
			cell.innerHTML = "δ";
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
				console.log(id);
				console.log(self.expressionList);
				id = id.replace("regex", "");
				expressions.push(self.expressionList[id]);
			}
		}
		console.log(checkboxes);
		console.log(expressions);
		return expressions;
	}

	// shows/hides the intersection button when appropriate
	function updateUI() {
		var checked = getCheckedExpressions();
		var numChecked = checked.length;
		var visible = "inline";
		deleteButton().style.display = (numChecked > 0) ? visible : "none";
		minimizeButton().style.display = (numChecked == 1) ? visible : "none";
		intersectionButton().style.display = (numChecked == 2) ? visible : "none";
		equivalenceButton().style.display = (numChecked == 2) ? visible : "none";
	}

	// Returns a list item containing a given expression.
	function regexListItem(obj) {
		var row = node("tr");
		row.id = genRegexID(obj.id);

		var regexCell = node("td");
		regexCell.className = "ertd"
		regexCell.innerHTML = obj.regex.string;
		row.appendChild(regexCell);

		var checkboxCell = node("td");
		checkboxCell.className = "checktd"
		var checkbox = node("input");
		checkbox.type = "checkbox";
		checkbox.addEventListener("change", updateUI);

		checkboxCell.appendChild(checkbox);
		row.appendChild(checkboxCell);
		return row;
	}

	// Adds an already-constructed object to this workspace.
	function addObject(obj) {
		self.expressionList[obj.id] = obj;
		self.update(obj);
	}

	// Initializes event handlers
	this.initEvents = function() {
		updateUI();
		deleteButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length == 0) {
				self.error(ERROR_INVALID_OPERATION);
				return;
			}

			for (var i = 0; i < expressions.length; i++) {
				var expr = expressions[i];
				var automatonNode = $("#" + genAutomatonID(expr.id));
				if (automatonNode) {
					automatonNode.parentElement.removeChild(automatonNode);
				}
				var regexNode = $("#" + genRegexID(expr.id));
				if (regexNode) {
					regexNode.parentElement.removeChild(regexNode);
				}
				delete self.expressionList[expr.id];
			}
			updateUI();
		});

		minimizeButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 1) {
				self.error(ERROR_INVALID_OPERATION);
				return;
			}

			var expr = expressions[0];
			if (expr.regex.string.startsWith(MINIMIZED_PREFIX)) {
				self.error(ERROR_ALREADY_MINIMIZED);
				return;
			}

			var clone = buildExprObject(expr.regex);
			clone.regex.string = MINIMIZED_PREFIX + " " + expr.regex.string;
			clone.automaton = expr.automaton.minimize();
			addObject(clone);
		});

		intersectionButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
				return;
			}

			var first = expressions[0];
			var second = expressions[1];
			var obj = buildExprObject(first.regex);
			obj.regex.string = "[∩] " + first.regex.string + ", " + second.regex.string;
			obj.automaton = first.automaton.intersection(second.automaton);
			addObject(obj);
		});

		equivalenceButton().addEventListener("click", function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
				return;
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
			for (var i in self.expressionList) {
				if (self.expressionList.hasOwnProperty(i)) {
					self.update(self.expressionList[i]);
				}
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
