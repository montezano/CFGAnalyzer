(function() {
"use strict";

var TRANSITION_SYMBOL = "➞";

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
	this.currentCFG = null;

	// Shows an error to the user.
	this.error = function(message) {
		alert(message);
	};

	// Sets the current CFG of this workspace.
	this.setCFG = function(cfg) {
		var instance = new CFG(cfg);
		if (!instance.isValid()) {
			self.error(ERROR_INVALID_GRAMMAR);
			return false;
		}
		self.currentCFG = instance;
		return true;
	};

	// Returns a string representation of this workspace, which can be
	// saved to a text file and later recovered via Workspace.load().
	this.toString = function() {
		return JSON.stringify(self.currentCFG);
	};


	// Receives the content of a file and adds the expressions it contains.
	this.load = function(fileContent) {
		var cfg;
		try {
			cfg = JSON.parse(fileContent);
		} catch (e) {
			alert("Invalid file");
			return;
		}
		self.setCFG(cfg);
	};
};

})();
