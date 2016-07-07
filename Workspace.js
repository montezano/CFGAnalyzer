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
		var fields = ["Non-Terminal", "Recursion", "Factorization", "First",
					  "Follow", "Derives &", "First ∩ Follow"];

		var table = node("table");
		var headerRow = node("tr");
		var header = node("th");
		header.innerHTML = "Analysis";
		header.colSpan = fields.length;
		headerRow.appendChild(header);
		table.appendChild(headerRow);

		var row, cell;
		row = node("tr");
		for (var i = 0; i < fields.length; i++) {
			cell = node("th");
			cell.innerHTML = fields[i];
			row.appendChild(cell);
		}
		table.appendChild(row);

		var EPSILON = Utilities.EPSILON;
		var RECURSION_TYPES = Utilities.RECURSION_TYPES;
		var FACTORIZATION_TYPES = Utilities.FACTORIZATION_TYPES;
		var cfg = self.currentCFG;
		var nonTerminals = cfg.getNonTerminals();
		var recursionInfo = cfg.getRecursionInformation();
		var factorizationInfo = cfg.getFactorizationInformation();
		var recursiveNT = recursionInfo.recursiveNonTerminals;
		var nonFactoredNT = factorizationInfo.nonFactoredNonTerminals;
		console.log(factorizationInfo);
		var first = cfg.first();
		var follow = cfg.follow();
		var firstFollowConflicts = [];
		for (var i = 0; i < nonTerminals.length; i++) {
			var name = nonTerminals[i];
			var recursionType = (recursiveNT.hasOwnProperty(name)) ?
								(recursiveNT[name] ? 1 : 2) :
								0;
			var factorizationType = (nonFactoredNT.hasOwnProperty(name)) ?
									(nonFactoredNT[name] ? 1 : 2) :
									0;
			var intFirstFollow = Utilities.intersection(first[name], follow[name]);
			var derivesEpsilon = first[name].includes(EPSILON);

			row = node("tr");
			row.appendChild(genCell(name));
			//row.appendChild(genCell(""));
			//row.appendChild(genCell(""));
			row.appendChild(genCell(RECURSION_TYPES[recursionType]));
			row.appendChild(genCell(FACTORIZATION_TYPES[factorizationType]));
			row.appendChild(genCell(first[name].join(", ")));
			row.appendChild(genCell(follow[name].join(", ")));
			row.appendChild(genCell(derivesEpsilon ? "Yes" : "No"));
			row.appendChild(genCell(intFirstFollow.join(", ")));
			table.appendChild(row);

			if (derivesEpsilon && intFirstFollow.length > 0) {
				firstFollowConflicts.push(name);
			}

			// TODO: add other anti-LL1 conditions once the recursion and
			// factoring test are implemented
			var isAntiLL1 = (derivesEpsilon && intFirstFollow.length > 0);
			if (isAntiLL1) {
				row.classList.add("antiLL1");
			}
		}

		for (var i = 0; i < firstFollowConflicts.length; i++) {
			var name = firstFollowConflicts[i];
			row = node("tr");
			cell = genCell(name + " has a first/follow conflict.");
			cell.colSpan = fields.length;
			row.appendChild(cell);
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
		cfg = cfg.replace(/</g, '&lt;').replace(/([^-])>/g, '$1&gt;');
		var instance;
		try {
			instance = new CFG(cfg);
		} catch (e) {
			self.error(e);
			return false;
		}
		self.currentCFG = instance;
		cfgContainer().innerHTML = instance.string.replace(/\n/g, "<br>");
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
