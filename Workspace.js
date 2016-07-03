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

var cfgContainer = function() {
	return $("#current_cfg");
};

var node = function(tag) {
	return document.createElement(tag);
};

var genCell = function(content) {
	var cell = node("td");
	cell.innerHTML = content;
	return cell;
};

window.Workspace = function() {
	var self = this;
	this.currentCFG = null;

	// Analyzes the current CFG of this workspace, printing informations such
	// as recursion data, factoring data, first, follow and parsing table.
	function printAnalysisTable() {
		var table = node("table");
		var headerRow = node("tr");
		var header = node("th");
		header.innerHTML = "Analysis";
		header.colSpan = 5;
		headerRow.appendChild(header);
		table.appendChild(headerRow);

		var row, cell;
		row = node("tr");
		var fields = ["Non-Terminal", "Recursive", "Factored", "First", "Follow"];
		for (var i = 0; i < fields.length; i++) {
			cell = node("th");
			cell.innerHTML = fields[i];
			row.appendChild(cell);
		}
		table.appendChild(row);

		var cfg = self.currentCFG;
		var nonTerminals = cfg.getNonTerminals();
		var first = cfg.first();
		var follow = cfg.follow();
		var recursionInfo = cfg.getRecursionInformation();
		var factorizationInfo = cfg.getFactorizationInformation();
		var recursiveNT = recursionInfo.recursiveNonTerminals;
		var nonFactoredNT = factorizationInfo.nonFactoredNonTerminals;
		for (var i = 0; i < nonTerminals.length; i++) {
			var name = nonTerminals[i];
			row = node("tr");
			row.appendChild(genCell(name));
			row.appendChild(genCell(""));
			row.appendChild(genCell(""));
			//row.appendChild(genCell(recursiveNT.includes(name) ? "Yes" : "No"));
			//row.appendChild(genCell(nonFactoredNT.includes(name) ? "No" : "Yes"));
			row.appendChild(genCell(first[name].join(", ")));
			row.appendChild(genCell(follow[name].join(", ")));
			table.appendChild(row);
		}
		container().appendChild(table);
	}

	// Updates the UI, replacing all previous content with the informations
	// about the current CFG.
	function updateUI() {
		container().innerHTML = "";
		printAnalysisTable();
	}

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
			self.error(e);
			return false;
		}
		self.currentCFG = instance;
		cfgContainer().innerHTML = cfg;
		updateUI();
		return true;
	};

	// Returns a string representation of this workspace, which can be
	// saved to a text file and later recovered via Workspace.load().
	this.toString = function() {
		return self.currentCFG.string;
	};


	// Receives the content of a file and adds the grammar it contains.
	this.load = function(fileContent) {
		self.setCFG(fileContent);
	};
};

})();
