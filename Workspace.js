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

var pointers = function() {
	return $(".productionPointer");
};

var productionContainer = function(index) {
	return $("#prod" + index);
};

var simulatorInput = function() {
	return $("#simulator_input");
};

var simulateButton = function() {
	return $("#simulate_btn");
};

var simulationResults = function() {
	return $("#simulationResults");
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
		var first = cfg.first();
		var follow = cfg.follow();
		var firstFollowConflicts = [];
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
			row.appendChild(genCell(derivesEpsilon ? "Yes" : "No"));
			row.appendChild(genCell(intFirstFollow.join(", ")));
			table.appendChild(row);

			if (derivesEpsilon && intFirstFollow.length > 0) {
				firstFollowConflicts.push(name);
			}

			var isAntiLL1 = recursionType || factorizationType || (derivesEpsilon && intFirstFollow.length > 0);
			if (isAntiLL1) {
				row.classList.add("antiLL1");
				isLL1 = false;
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
		return isLL1;
	}

	// Prints the parsing table of the current CFG of this workspace.
	function printParsingTable() {
		var DOLLAR = Utilities.DOLLAR;
		var cfg = self.currentCFG;
		var nonTerminals = cfg.getNonTerminals();
		var terminals = cfg.getTerminals().concat([DOLLAR]);
		try {
			var parsingTable = cfg.parsingTable();
		} catch (e) {
			return;
		}

		var table = node("table");
		table.classList.add("padded");
		table.classList.add("inline");
		var row = node("tr");
		var cell = genCell("Parsing Table", 1);
		cell.colSpan = terminals.length + 1;
		row.appendChild(cell);
		table.appendChild(row);

		var row = node("tr");
		row.appendChild(genCell("", true));
		for (var i = 0; i < terminals.length; i++) {
			row.appendChild(genCell(terminals[i], true));
		}
		table.appendChild(row);

		for (var i = 0; i < nonTerminals.length; i++) {
			row = node("tr");
			row.appendChild(genCell(nonTerminals[i], true));
			for (var j = 0; j < terminals.length; j++) {
				var content = parsingTable[nonTerminals[i]][terminals[j]];
				cell = genCell(Utilities.NO_TRANSITION);
				if (content !== null) {
					cell.innerHTML = content;
					cell.classList.add("productionPointer");
				}
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		container().appendChild(table);
	}

	// Prints a table containing each production of this CFG and its index.
	function printProductionIndexes() {
		var cfg = self.currentCFG;
		var productionList = cfg.productionList();

		var table = node("table");
		table.classList.add("padded");
		table.classList.add("inline");
		var row = node("tr");
		var cell = genCell("Index Table", true);
		cell.colSpan = 2;
		row.appendChild(cell);
		table.appendChild(row);
		for (var i = 0; i < productionList.length; i++) {
			var pair = productionList[i];
			row = node("tr");
			row.id = "prod" + i;
			row.appendChild(genCell(pair[0] + " -> " + pair[1].join(" ")));
			row.appendChild(genCell(i));
			table.appendChild(row);
		}
		container().appendChild(table);
	}

	// Prints a parser simulator.
	function printSimulator() {
		var cfg = self.currentCFG;

		var table = node("table");
		table.classList.add("inline");
		var row = node("tr");
		row.appendChild(genCell("Parser Simulator", true));
		table.appendChild(row);

		row = node("tr");
		var cell = node("td");
		var input = node("input");
		input.type = "text";
		input.placeholder = "Type a sentence...";
		input.id = "simulator_input";
		cell.appendChild(input);
		cell.appendChild(node("br"));

		input = node("input");
		input.type = "button";
		input.value = "Simulate";
		input.id = "simulate_btn";
		cell.appendChild(input);
		row.appendChild(cell);
		table.appendChild(row);
		container().appendChild(table);
	}

	// Prints the output of a simulation.
	function printSimulatorOutput(output) {
		var accepted = output[0];
		var history = output[1];
		var errorIndex = output[2];
		var errorMessage = output[3];

		var input = simulatorInput().value;
		input = (input.replace(/\s+/g, ' ') + ' ' + Utilities.DOLLAR).trim();
		var symbols = input.split(' ');

		var table = node("table");
		table.id = "simulationResults";
		var row = node("tr");
		row.appendChild(genCell("Simulation Results", true));
		table.appendChild(row);

		var statusLabel = Utilities.SIMULATION_STATUS[accepted * 1];
		row = node("tr");
		row.appendChild(genCell("Status: " + statusLabel));
		table.appendChild(row);

		row = node("tr");
		if (accepted) {
			row.appendChild(genCell(symbols.join(' ')));
		} else {
			var content = symbols.slice(0, errorIndex).join(' ') + " ";
			content += "<span class='error'>" + symbols[errorIndex] + "</span>";
			content += " " + symbols.slice(errorIndex + 1).join(' ');
			row.appendChild(genCell(content));
		}
		table.appendChild(row);

		if (!accepted) {
			row = node("tr");
			row.appendChild(genCell(errorMessage));
			table.appendChild(row);
		}

		row = node("tr");
		row.appendChild(genCell("Derivation Sequence", true));
		table.appendChild(row);

		for (var i = 0; i < history.length; i++) {
			row = node("tr");
			var cell = genCell(history[i]);
			cell.classList.add("productionPointer");
			row.appendChild(cell);
			table.appendChild(row);
		}

		container().appendChild(table);
	}

	// Updates the UI, replacing all previous content with the informations
	// about the current CFG.
	function updateUI() {
		container().innerHTML = "";
		var isLL1 = printAnalysisTable();
		if (isLL1) {
			printSimulator();
			printParsingTable();
			printProductionIndexes();
		}
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

		if (simulateButton()) {
			simulateButton().addEventListener("click", function() {
				var container = simulationResults();
				if (container) {
					container.parentElement.removeChild(container);
				}

				var output = self.currentCFG.evaluate(simulatorInput().value);
				printSimulatorOutput(output);
				updateEvents();
			});
		}
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
		cfgContainer().innerHTML = instance.string.replace(/</g, '&lt;').replace(/([^-])>/g, '$1&gt;').replace(/\n/g, "<br>");
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
