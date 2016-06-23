(function() {
"use strict";

var ERROR_INVALID_REGEX = "Invalid regular expression";
var ERROR_INVALID_OPERATION = "Invalid operation";
var ERROR_ALREADY_MINIMIZED = "The selected expression is already minimized";
var NO_TRANSITION = "—";
var INITIAL_STATE = "➞";
var ACCEPTING_STATE = "<span class='accepting_state'>*</span>";
var TRANSITION_SYMBOL = "δ";
var MINIMIZED_PREFIX = "[MIN]";
var INTERSECTION_PREFIX = "[∩]";
var COMPLEMENT_PREFIX = "[NOT]";

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

var equivalenceLabel = function() {
	return $("#equivalence_result");
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

var nextID = 0;

// Returns an object containing a regex, its corresponding
// automaton and an ID.
function buildExprObject(regex) {
	return {
		id: nextID++,
		regex: (regex) ? regex : new Regex(""),
		automaton: (regex) ? regex.toFiniteAutomaton() : null
	};
}

window.Workspace = function() {
	var self = this;
	this.expressionList = {};

	// Returns an object containing:
	// - An ID
	// - A regex instance with a properly formatted name corresponding
	//   to the intersection between the given expression objects
	// - A finite automaton that recognizes the intersection of two
	//	 languages
	function buildIntersectionObj(firstObj, secondObj) {
		var result = buildExprObject(null);
		result.regex.string = INTERSECTION_PREFIX + " {" + firstObj.regex.string + ", " + secondObj.regex.string + "}";
		result.automaton = firstObj.automaton.intersection(secondObj.automaton).minimize();
		return result;
	}

	// Returns an object containing:
	// - An ID
	// - A regex instance with a properly formatted name corresponding
	//   to the complement of a given expression object
	// - A finite automaton that recognizes the complement of a language
	function buildComplementObj(obj) {
		var result = buildExprObject(null);
		result.regex.string = COMPLEMENT_PREFIX + " " + obj.regex.string;
		result.automaton = obj.automaton.complement();
		return result;
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
			var cell = node("th");
			cell.colSpan = alphabet.length + 1;
			cell.innerHTML = regex.string;
			header.appendChild(cell);
			table.appendChild(header);

			header = node("tr");
			cell = node("th");
			// cell.classList.add("emptyCell");
			cell.innerHTML = TRANSITION_SYMBOL;
			header.appendChild(cell);

			for (var i = 0; i < alphabet.length; i++) {
				cell = node("th");
				cell.innerHTML = alphabet[i];
				header.appendChild(cell);
			}
			table.appendChild(header);

			var row;
			var transitions = automaton.transitions;
			for (var i = 0; i < automaton.stateList.length; i++) {
				var state = automaton.stateList[i];
				row = node("tr");
				cell = node("th");
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
		var visible = "inline";
		deleteButton().style.display = (numChecked > 0) ? visible : "none";
		minimizeButton().style.display = (numChecked == 1) ? visible : "none";
		intersectionButton().style.display = (numChecked == 2) ? visible : "none";
		equivalenceButton().style.display = (numChecked == 2) ? visible : "none";
		equivalenceLabel().innerHTML = "";
	}

	// Returns a list item containing a given expression.
	function regexListItem(obj) {
		var row = node("tr");
		row.id = genRegexID(obj.id);

		var regexCell = node("td");
		regexCell.className = "ertd";
		regexCell.innerHTML = obj.regex.string;
		row.appendChild(regexCell);

		var checkboxCell = node("td");
		checkboxCell.className = "checktd";
		var checkbox = node("input");
		checkbox.type = "checkbox";
		checkbox.addEventListener("change", updateUI);

		checkboxCell.appendChild(checkbox);
		row.appendChild(checkboxCell);
		return row;
	}

	// Initializes event handlers
	this.initEvents = function() {
		updateUI();
		deleteButton().onclick = function() {
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
		};

		minimizeButton().onclick = function() {
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

			var clone = buildExprObject(null);
			clone.regex.string = MINIMIZED_PREFIX + " " + expr.regex.string;
			clone.automaton = expr.automaton.minimize();
			self.addObject(clone);
		};

		intersectionButton().onclick = function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
				return;
			}

			var first = expressions[0];
			var second = expressions[1];
			self.addObject(buildIntersectionObj(first, second));
		};

		equivalenceButton().onclick = function() {
			var expressions = getCheckedExpressions();
			if (expressions.length != 2) {
				self.error(ERROR_INVALID_OPERATION);
				return;
			}

			var firstExpr = expressions[0];
			var secondExpr = expressions[1];

			var notM1 = buildComplementObj(firstExpr);
			self.addObject(notM1);

			var notM2 = buildComplementObj(secondExpr);
			self.addObject(notM2);

			var intM1notM2 = buildIntersectionObj(firstExpr, notM2);
			self.addObject(intM1notM2);

			var intM2notM1 = buildIntersectionObj(secondExpr, notM1);
			self.addObject(intM2notM1);

			var areEquivalent = intM1notM2.automaton.isEmpty() && intM2notM1.automaton.isEmpty();
			equivalenceLabel().innerHTML = "The selected expressions are " + (areEquivalent ? "" : "not ") + "equivalent.";
		};
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
		self.addObject(obj);
		return true;
	};

	// Adds an already-constructed object to this workspace.
	this.addObject = function(obj) {
		self.expressionList[obj.id] = obj;
		self.update(obj);
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
		if (!automatonNode) {
			container().appendChild(printableAutomaton(obj));
		}

		var regexNode = $("#" + genRegexID(obj.id));
		if (!regexNode) {
			regexList().appendChild(regexListItem(obj));
		}
	};

	// Returns a string representation of this workspace, which can be
	// saved to a text file and later recovered via Workspace.load().
	this.toString = function() {
		return JSON.stringify(self.expressionList);
	};


	// Receives the content of a file and adds the expressions it contains.
	this.load = function(fileContent) {
		var expressionList;
		try {
			expressionList = JSON.parse(fileContent);
		} catch (e) {
			alert("Invalid file");
			return;
		}

		for (var i in expressionList) {
			if (expressionList.hasOwnProperty(i)) {
				var expr = expressionList[i];
				var obj = buildExprObject(null);
				obj.regex.string = expr.regex.string;
				obj.automaton = FiniteAutomaton.load(expr.automaton);
				self.addObject(obj);
			}
		}
	};
};

})();
