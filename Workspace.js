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

var node = function(tag) {
	return document.createElement(tag);
};

window.Workspace = function() {
	var self = this;
	this.currentCFG = null;

	// Shows an error to the user.
	this.error = function(message) {
		alert(message);
	};

	// Sets the current CFG of this workspace.
	this.setCFG = function(cfg) {
		var instance;
		try {
			instance = new CFG(cfg);
		} catch (e) {
			self.error(ERROR_INVALID_GRAMMAR);
			return false;
		}
		self.currentCFG = instance;

		var first = instance.first();
		for (var name in first) {
			if (first.hasOwnProperty(name)) {
				console.log(name + ": " + first[name].join(", "));
			}
		}
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
