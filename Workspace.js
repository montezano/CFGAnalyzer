(function() {
"use strict";

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

var analyedCfgContainer = function() {
	return $("#analyzed_cfg")
};

var maxFactorizationSteps = function() {
	return parseInt($("#n_factorization").value);
};

var pointers = function() {
	return $(".productionPointer");
};

var productionContainer = function(index) {
	return $("#prod" + index);
};

var node = function(tag) {
	return document.createElement(tag);
};

var genCell = function(content, isLabel) {
	var cell = node(isLabel ? "th" : "td");
	cell.innerHTML = content;
	return cell;
};

window.Workspace = function() {
	var self = this;
	this.currentCFG = null;
	this.analyzedCFG = null;

	this.epsilonFree;
	this.removeSimpleProductions;
	this.removeUnreachables;
	this.removeInfertiles;
	this.removeLeftRecursion;
	this.leftFactor;

	// Analyzes the current CFG of this workspace, printing informations such
	// as recursion data, factoring data, first, follow and parsing table.
	function printAnalysisTable() {
		var fields = ["Non-Terminal", "Recursion", "Factorization", "First",
					  "Follow", "First-NT"];

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
		var first = cfg.first();
		var firstNT = cfg.firstNT();
		var follow = cfg.follow();
		var isLL1 = true;
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
			row.appendChild(genCell(RECURSION_TYPES[recursionType]));
			row.appendChild(genCell(FACTORIZATION_TYPES[factorizationType]));
			row.appendChild(genCell(first[name].join(", ")));
			row.appendChild(genCell(follow[name].join(", ")));
			row.appendChild(genCell(firstNT[name].join(", ")));
			table.appendChild(row);

			// if (derivesEpsilon && intFirstFollow.length > 0) {
			// 	firstFollowConflicts.push(name);
			// }

			var isAntiLL1 = recursionType || factorizationType || (derivesEpsilon && intFirstFollow.length > 0);
			if (isAntiLL1) {
				row.classList.add("antiLL1");
				isLL1 = false;
			}
		}


		container().appendChild(table);

		self.epsilonFree = cfg.stringfyCFG(cfg.epsilonFree());
		self.removeSimpleProductions = cfg.stringfyCFG(cfg.removeSimpleProductions());
		self.removeUnreachables = cfg.stringfyCFG(cfg.removeUnreachables());
		self.removeInfertiles = cfg.stringfyCFG(cfg.removeInfertiles());
		self.removeLeftRecursion = cfg.stringfyCFG(cfg.removeLeftRecursion());
		self.leftFactor = cfg.stringfyCFG(cfg.leftFactor(maxFactorizationSteps()));

		return isLL1;
	}


	function printIsFactored() {
		var cfg = self.currentCFG;
		var factorizationInfo = cfg.getFactorizationInformation();
		var table = node("table");
		table.id = "factorizationResult";
		var row = node("tr");
		row.appendChild(genCell("Factored", true));
		row.appendChild(genCell(factorizationInfo.isFactored));
		table.appendChild(row);
		container().appendChild(table);
	}

	// Updates the UI, replacing all previous content with the informations
	// about the current CFG.
	function updateUI() {
		container().innerHTML = "";
		printAnalysisTable();
		printIsFactored();
		printCFGs();
		updateEvents();

	}

	// Updates all interface-related events.
	function updateEvents() {
		var pointerList = pointers();
		for (var i = 0; i < pointerList.length; i++) {
			var element = pointerList[i];
			element.addEventListener("mouseover", function() {
				productionContainer(this.innerHTML).classList.add("highlight");
			});
			element.addEventListener("mouseout", function() {
				productionContainer(this.innerHTML).classList.remove("highlight");
			});
		}
	}

	function printCFGs() {
		self.setCFGAlt(self.epsilonFree, "Epsilon free");
		self.setCFGAlt(self.removeSimpleProductions, "Cicle free");
		self.setCFGAlt(self.removeUnreachables, "Unreachable free");
		self.setCFGAlt(self.removeInfertiles, "Infertile free");
		self.setCFGAlt(self.removeLeftRecursion, "LR free");
		self.setCFGAlt(self.leftFactor, "Factored in " + maxFactorizationSteps());
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
		cfgContainer().innerHTML = "Current CFG:<br>"
		cfgContainer().innerHTML += instance.string.replace(/</g, '&lt;').replace(/([^-])>/g, '$1&gt;').replace(/\n/g, "<br>");
		updateUI();
		return true;
	};

	this.setCFGAlt = function(cfg, type) {

		analyedCfgContainer().innerHTML += type + " CFG:<br>"
		analyedCfgContainer().innerHTML += cfg.replace(/</g, '&lt;').replace(/([^-])>/g, '$1&gt;').replace(/\n/g, "<br>");
		analyedCfgContainer().innerHTML += "<br><br>";

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
