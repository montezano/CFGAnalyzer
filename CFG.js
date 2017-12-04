(function() {
"use strict";

var DOLLAR = Utilities.DOLLAR;
var EPSILON = Utilities.EPSILON;

window.CFG = function(cfgStr) {
	var self = this;
	this.productions = {};
	this.initialSymbol = null;
	this.firstData = null;
	this.firstNT = null;
	this.epsilonFreeCFG = {};
	this.cicleFreeCFG = {};
	this.unreachablesFreeCFG = {};
	this.infertileFreeCFG = {};
	this.leftRecursionFreeCFG = {};
	this.factoredCFG = {};

	/*
	Receives a string representation of a group of productions
	involving one non-terminal and returns an object representing
	them or null if they're not valid.
	Example:
		Input: "S -> a S b | id | &"
		Output: {
			S: [["a", "S", "b"], ["id"], ["&"]]
		}
	*/
	function stringToProduction(str) {
		var map = {};
		var explodedStr = str.split(' ');

		if (!explodedStr.includes("->")) return null;

		var dividedStr = explodedStr.splitFirst('->');
		if (dividedStr.length != 2) return null;

		if (dividedStr[0].length != 1) return null
		var initialSymbol = dividedStr[0][0];

		if (!Utilities.isNonTerminal(initialSymbol)) return null;

		var productions = dividedStr[1].split('|');

		for (var i = 0; i < productions.length; i++) {
			if (productions[i].length < 1 || productions[i] == "") {
				return null;
			} else {
				// There's at least one production
				for (var k = 0; k < productions[i].length; k++) {
					if (productions[i][k] != productions[i][k].toLowerCase()) {
						if (!Utilities.isNonTerminal(productions[i][k])) {
							return null;
						}
					}
				}
			}
		}

		map[initialSymbol] = productions;
		return map;
	};

	// An utility function used to iterate over all productions of this CFG,
	// executing a callback function on each one providing their name and list
	// of produced symbols.
	function productionIteration(callback) {
		for (var name in self.productions) {
			if (self.productions.hasOwnProperty(name)) {
				for (var i = 0; i < self.productions[name].length; i++) {
					callback(name, self.productions[name][i]);
				}
			}
		}
	};

	// An utility function used to iterate over all productions of this CFG,
	// executing a callback function on each one providing their name and list
	// of produced symbols.
	function productionIterationAltCFG(callback, cfg) {
		for (var name in cfg) {
			if (cfg.hasOwnProperty(name)) {
				for (var i = 0; i < cfg[name].length; i++) {
					callback(name, cfg[name][i]);
				}
			}
		}
	};

	// Checks if this grammar is consistent, i.e, if all used non-terminals are
	// defined.
	function checkConsistency() {
		var nonTerminals = self.getNonTerminals();
		var undefinedNonTerminals = [];
		productionIteration(function(name, production) {
			for (var i = 0; i < production.length; i++) {
				var symbol = production[i];
				if (Utilities.isNonTerminal(symbol) && !nonTerminals.includes(symbol)) {
					undefinedNonTerminals.push(symbol);
				}
			}
		});

		if (undefinedNonTerminals.length > 0) {
			throw Utilities.ERROR_INVALID_GRAMMAR +
				  ". The following symbols are undefined: " + undefinedNonTerminals.join(", ");
		}
	}

	// Receives a string representation of a group of productions
	// involving one non-terminal and adds all of them to this CFG.
	this.addProductions = function(str) {
		var productions = stringToProduction(str);
		if (!productions) {
			return false;
		}
		for (var name in productions) {
			if (productions.hasOwnProperty(name)) {
				for (var i = 0; i < productions[name].length; i++) {
					self.addProduction(name, productions[name][i]);
				}
			}
		}
		return true;
	};

	// Receives the informations about a production and adds it
	// to this CFG.
	this.addProduction = function(name, symbolSequence) {
		if (!self.productions.hasOwnProperty(name)) {
			self.productions[name] = [];
		}
		self.productions[name].push(symbolSequence);
		if (!self.initialSymbol) {
			self.initialSymbol = name;
		}
	};

	// Receives the informations about a production and adds it
	// to this CFG.
	this.addProductionAltCFG = function(name, symbolSequence, cfg) {
		if (!cfg.hasOwnProperty(name)) {
			cfg[name] = [];
		}
		cfg[name].push(symbolSequence);
	};

	// Receives the informations about a production and removes it
	// from this CFG.
	this.removeProduction = function(name, symbolSequence) {
		if (!self.productions.hasOwnProperty(name)) {
			return;
		}
		var index = Utilities.indexOf(self.productions[name], symbolSequence);
		if (index >= 0) {
			self.productions[name].splice(index, 1);
		}
	};

	// Receives the informations about a production and removes it
	// from this CFG.
	this.removeProductionAltCFG = function(name, symbolSequence, cfg) {
		if (!cfg.hasOwnProperty(name)) {
			return;
		}
		var index = Utilities.indexOf(cfg[name], symbolSequence);
		if (index >= 0) {
			cfg[name].splice(index, 1);
		}
	};

	// Returns a list containing all non-terminals of this CFG.
	this.getNonTerminals = function() {
		return Object.keys(self.productions);
	};

	// Returns a list containing all terminals of this CFG.
	this.getTerminals = function() {
		var result = [];
		productionIteration(function(name, production) {
			for (var i = 0; i < production.length; i++) {
				var symbol = production[i];
				if (Utilities.isTerminal(symbol)) {
					result.push(symbol);
				}
			}
		});
		Utilities.removeDuplicates(result);
		return result;
	};

	// Returns a map associating each non-terminal of this grammar with a list
	// of all non-terminals that it reaches as the first symbol of its productions.
	function getLeftRangeTable() {
		var rangeTable = {};
		productionIteration(function(name, production) {
			if (!rangeTable.hasOwnProperty(name)) {
				rangeTable[name] = [];
			}

			if (Utilities.isNonTerminal(production[0])) {
				rangeTable[name].push(production[0]);
			}
		});

		var stable = false;
		while (!stable) {
			stable = true;
			for (var name in rangeTable) {
				if (!rangeTable.hasOwnProperty(name)) continue;
				var length = rangeTable[name].length;
				for (var i = 0; i < length; i++) {
					var nonTerminal = rangeTable[name][i];
					rangeTable[name] = rangeTable[name].concat(rangeTable[nonTerminal]);
				}
				Utilities.removeDuplicates(rangeTable[name]);
				if (rangeTable[name].length != length) {
					stable = false;
				}
			}
		}
		return rangeTable;
	}

	/*
	Returns an object containing:
	- hasLeftRecursion: true if this grammar has a left recursion, false otherwise;
	- recursiveNonTerminals: a map associating each recursive non-terminal of
	  this grammar with the type of recursion it has (true for direct, false
	  for indirect)
	*/
	this.getRecursionInformation = function() {
		var DIRECT = true;
		var INDIRECT = false;
		var result = {
			hasLeftRecursion: false,
			recursiveNonTerminals: {}
		};
		productionIteration(function(name, production) {
			if (production[0] == name) {
				result.hasLeftRecursion = true;
				result.recursiveNonTerminals[name] = DIRECT;
			}
		});

		var rangeTable = getLeftRangeTable();
		for (var name in rangeTable) {
			if (rangeTable.hasOwnProperty(name)
				&& rangeTable[name].includes(name)
				&& !result.recursiveNonTerminals.hasOwnProperty(name)) {
				result.hasLeftRecursion = true;
				result.recursiveNonTerminals[name] = INDIRECT;
			}
		}
		return result;
	};

	/*
	Returns an object containing:
	- isFactored: true if this grammar is factored, false otherwise;
	- nonFactoredNonTerminals: a map associating each non-factored non-terminal
	  of this grammar with the type of non-factorization it has (true for direct,
	  false for indirect)
	*/
	this.getFactorizationInformation = function(cfg) {
		if (!cfg) cfg = self.productions;
		var DIRECT = true;
		var INDIRECT = false;
		var result = {
			isFactored: true,
			nonFactoredNonTerminals: {}
		};
		var firstTable = {};
		var directFirstTable = {};
		self.firstData = self.first();
		productionIterationAltCFG(function(name, production) {
			if (!firstTable.hasOwnProperty(name)) {
				firstTable[name] = {};
			}

			if (!directFirstTable.hasOwnProperty(name)) {
				directFirstTable[name] = {};
			}

			if (directFirstTable[name].hasOwnProperty(production[0])) {
				result.isFactored = false;
				result.nonFactoredNonTerminals[name] = DIRECT;
			} else {
				directFirstTable[name][production[0]] = 1;
			}

			var first = compositeFirst(production);
			for (var i = 0; i < first.length; i++) {
				if (!result.nonFactoredNonTerminals.hasOwnProperty(name)
					&& firstTable[name].hasOwnProperty(first[i])) {
					result.isFactored = false;
					result.nonFactoredNonTerminals[name] = INDIRECT;
					break;
				}
				firstTable[name][first[i]] = 1;
			}
		}, cfg);
		return result;
	};

	// Pushes all non-epsilon symbols of a list to another list and returns
	// true if an epsilon has been found, false otherwise.
	function pushNonEpsilons(origin, destination) {
		var hasEpsilon = false;
		var length = origin.length;
		for (var i = 0; i < length; i++) {
			if (origin[i] == EPSILON) {
				hasEpsilon = true;
			} else {
				destination.push(origin[i]);
			}
		}
		return hasEpsilon;
	}

	// Populates a map with the first set of a given non-terminal and all
	// other non-terminals it depends on.
	function populateFirst(container, nonTerminal, visited, uncertain) {
		if (!visited.includes(nonTerminal)) {
			if (!container.hasOwnProperty(nonTerminal)) {
				container[nonTerminal] = [];
			}
			visited.push(nonTerminal);
		} else {
			return;
		}

		var productions = self.productions[nonTerminal];
		for (var i = 0; i < productions.length; i++) {
			var production = productions[i];
			if (Utilities.isTerminal(production[0]) || production[0] == EPSILON) {
				container[nonTerminal].push(production[0]);
				if (production[0] == EPSILON) {
					uncertain.push(nonTerminal);
				}
				continue;
			}

			var j = 0;
			while (j < production.length) {
				if (Utilities.isTerminal(production[j])) {
					container[nonTerminal].push(production[j]);
					break;
				}

				populateFirst(container, production[j], visited, uncertain);
				var first = container[production[j]];
				var hasEpsilon = pushNonEpsilons(first, container[nonTerminal]);
				if (!hasEpsilon) {
					break;
				}
				j++;
			}

			if (j == production.length) {
				container[nonTerminal].push(EPSILON);
				uncertain.push(nonTerminal);
			}
		}
	}

	function populateFirstNT(nonTerminal, firstNT) {
		if (!firstNT.includes(nonTerminal)) {
			firstNT.push(nonTerminal);
		} else {
			return;
		}

		var productions = self.productions[nonTerminal];
		for (var i = 0; i < productions.length; i++) {
			var production = productions[i];

			for (var j = 0; j < production.length; j++) {
				if (Utilities.isNonTerminal(production[j])) {
					populateFirstNT(production[j], firstNT);

					if (!compositeFirst(production[j]).includes(EPSILON)) {
						break;
					}
				} else {
					break;
				}
			}
		}
	}

	// Returns the first set of a sequence of symbols, given that the first
	// set of all non-terminals are available in self.firstData.r
	function compositeFirst(symbolSequence) {
		var result = [];
		if (symbolSequence.length == 0
			|| (symbolSequence.length == 1 && symbolSequence[0] == EPSILON)) {
			result.push(EPSILON);
			return result;
		}

		var shouldPushEpsilon = true;
		for (var i = 0; i < symbolSequence.length; i++) {
			var symbol = symbolSequence[i];
			if (Utilities.isTerminal(symbol)) {
				result.push(symbol);
				shouldPushEpsilon = false;
				break;
			}

			var first = self.firstData[symbol];
			var hasEpsilon = pushNonEpsilons(first, result);
			if (!hasEpsilon) {
				shouldPushEpsilon = false;
				break;
			}
		}

		Utilities.removeDuplicates(result);
		if (shouldPushEpsilon) {
			result.push(EPSILON);
		}
		return result;
	}

	// Populates a map with the preliminary follow set of non-terminals
	// used in a given production.
	function populateFollow(container, nonTerminal, production) {
		for (var i = 0; i < production.length; i++) {
			var symbol = production[i];
			if (Utilities.isNonTerminal(symbol)) {
				var remaining = production.slice(i + 1);
				var first = compositeFirst(remaining);
				var hasEpsilon = pushNonEpsilons(first, container[symbol]);
				if (hasEpsilon) {
					container[symbol] = container[symbol].concat(container[nonTerminal]);
				}
			}
		}
	}

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding first array.
	this.first = function() {
		if (self.firstData != null) {
			return self.firstData;
		}
		var result = {};
		var nonTerminals = self.getNonTerminals();
		var uncertain = [];
		var visited = [];
		for (var i = 0; i < nonTerminals.length; i++) {
			visited = [];
			populateFirst(result, nonTerminals[i], visited, uncertain);
		}

		Utilities.removeDuplicates(uncertain);

		visited = [];
		while (uncertain.length > 0) {
			// Prevents a bug where &-transitions could make the
			// first set become incomplete
			populateFirst(result, uncertain.pop(), visited, uncertain);
		}

		for (var i = 0; i < nonTerminals.length; i++) {
			Utilities.removeIndexableDuplicates(result[nonTerminals[i]]);
		}

		self.firstData = result;
		return result;
	};

	this.firstNT = function() {
		if (self.firstNTData != null) {
			return self.firstNTData;
		}

		var result = {};
		var nonTerminals = self.getNonTerminals();

		for (var i = 0; i < nonTerminals.length; i++) {
			result[nonTerminals[i]] = [];
			populateFirstNT(nonTerminals[i], result[nonTerminals[i]]);
			Utilities.removeIndexableDuplicates(result[nonTerminals[i]]);
		}

		self.firstNTData = result;
		return result;
	}

	// Returns a map associating each non-terminal of this grammar
	// with its corresponding follow array.
	this.follow = function() {
		var result = {};
		var nonTerminals = self.getNonTerminals();
		for (var i = 0; i < nonTerminals.length; i++) {
			result[nonTerminals[i]] = [];
			if (self.initialSymbol == nonTerminals[i]) {
				result[nonTerminals[i]].push(DOLLAR);
			}
		}

		self.firstData = self.first();
		var prevFollow = "", currFollow = "{}";
		while (prevFollow != currFollow) {
			prevFollow = currFollow;
			productionIteration(function(name, production) {
				populateFollow(result, name, production);
			});

			for (var i = 0; i < nonTerminals.length; i++) {
				Utilities.removeDuplicates(result[nonTerminals[i]]);
			}
			currFollow = JSON.stringify(result);
		}
		return result;
	};


	this.epsilonFree = function() {
		var epsFreeRet = false;
		for (var name in self.productions) {
			if (self.productions.hasOwnProperty(name)) {
				self.epsilonFreeCFG[name] = [];
				epsFreeRet |= pushNonEpsilons(self.productions[name], self.epsilonFreeCFG[name]);
			}
		}

		if (!epsFreeRet) {
			return true;
		}

		var epsilonList = [];
		var newEpsListSize = 0;
		var oldEpsListSize = -1;
		while (epsilonList.length != oldEpsListSize) {
			oldEpsListSize = epsilonList.length;
			productionIteration(function(name, production) {
				if (production == EPSILON) {
					if(!epsilonList.includes(name))
					{
						epsilonList.push(name);	
					}
				}
			});
		}

		for (var i = 0; i < epsilonList.length; i++)
		{
			productionIteration(function(name, production) {

				if (production.includes(epsilonList[i])) {
					var newProd = production.filter(function(elem, j, array) {
						//console.log("prodname: " + elem);
						//console.log("epsilon: " + epsilonList[i]);
						return elem != epsilonList[i];
					});

					if (!self.epsilonFreeCFG[name].includes(newProd)) {
						self.addProductionAltCFG(name, newProd, self.epsilonFreeCFG);	
					}
					
					// self.epsilonFreeCFG[name].push(newProd);	
				}
			});
		}

		var hasEps = false;

		for (var i = 0; i < self.productions[self.initialSymbol].length; i++) {
			if (self.productions[self.initialSymbol][i] == EPSILON ) {
				hasEps = true;
			}
		}

		if(hasEps) {

			for (var i = 0; i < self.epsilonFreeCFG[self.initialSymbol].length; i++) {
				self.addProductionAltCFG("Z", self.epsilonFreeCFG[self.initialSymbol][i], self.epsilonFreeCFG);
			}

			self.addProductionAltCFG("Z", [EPSILON], self.epsilonFreeCFG);

			self.initialSymbol = "Z";


		}

		return self.epsilonFreeCFG;
	};

	this.removeSimpleProductions = function() {
		var n = {};
		//populate N set initial non terminals
		for (var epsFreeProd in self.epsilonFreeCFG) {
			n[epsFreeProd] = [];
			n[epsFreeProd].push(epsFreeProd);
		}

		productionIterationAltCFG(function(name, production) {
			if (production.length > 1 || Utilities.isTerminal(production) || (production == EPSILON)) {
				self.addProductionAltCFG(name, production, self.cicleFreeCFG);
			}
		}, self.epsilonFreeCFG);


		// populate N set
		var changed = true;
		while(changed) {
			changed = false;



			productionIterationAltCFG(function(name, production) {
				if(production.length == 1) {
					if (n.hasOwnProperty(production)) {
						if(!n[name].includes(production[0])) {
							n[name].push(production[0]);	
							changed = true;

							self.cicleFreeCFG[name] = Utilities.concatNoDups(self.cicleFreeCFG[name], self.cicleFreeCFG[production[0]]);
						}	
					}				
				}
			}, self.epsilonFreeCFG);


			if (changed) {
				for (var nName in n) {
					if (n.hasOwnProperty(nName)) {
						for (var i = 0; i < n[nName].length; i++) {
							var ntemp = n[nName];
							var nConc = Utilities.concatNoDups(n[nName], n[n[nName][i]]);

							if(!Utilities.arraysEqual(ntemp, nConc)) {
								changed = true;
								n[nName] = nConc;
								console.log(n);

							}
						}
							
					}
				}
			}
		}

		changed = true;
		while(changed) {
			changed = false;
			for (var nName in n) {

				// var concTempProd;
				if (n.hasOwnProperty(nName)) {
					var tempProd = self.cicleFreeCFG[nName];
					var prodSize = tempProd.length;

					for (var i = 0; i < n[nName].length; i++) {
						tempProd = Utilities.concatNoDups(self.cicleFreeCFG[n[nName][i]], tempProd);
					}

					if (prodSize != tempProd.length) {
						self.cicleFreeCFG[nName] = tempProd;
						changed = true;
					}
				}
			}	
		}

		return self.cicleFreeCFG;
	}

	this.removeUnreachables = function() {
		var v = [];
		v.push(self.initialSymbol);

		var changed = true;

		while(changed) {
			changed = false;
			for (var i = 0; i < v.length; i++) {

				if (Utilities.isNonTerminal(v[i])) {
					var tempProd = self.cicleFreeCFG[v[i]];


					productionIterationAltCFG(function(name, production) {
						if (name === v[i]) {
							for (var j = 0; j < production.length; j++) {
								if (!v.includes(production[j])) {
									v.push(production[j]);
									changed = true;
								}
							}	
						}
					}, self.cicleFreeCFG);
				}
			}
		}

		productionIterationAltCFG(function(name, production) {
			if (v.includes(name)) {
				var includesAll = true;
				for (var i = 0; i < production.length; i++) {
					if (!v.includes(production[i])) {
						includesAll = false;
					}
				}
				if (includesAll) {
					self.addProductionAltCFG(name, production, self.unreachablesFreeCFG);
				}
			}
		}, self.cicleFreeCFG);

		return self.unreachablesFreeCFG;
	}

	this.removeInfertiles = function() {
		var n = [];

		var changed = true;

		while(changed)
		{
			changed = false;

			productionIterationAltCFG(function(name, production) {
				var allTerminals = true;
				var includesAll = true;
				var includesComposition = true;
				for (var i = 0; i < production.length; i++) {

					if ( !Utilities.isTerminal(production[i])  ) {
						if(production[i] != EPSILON) {
							allTerminals = false;	
						}						
					}

					if ( !n.includes(production[i]) ) {
						includesAll = false;
					} 

					if ( !Utilities.isTerminal(production[i]) &&
						!n.includes(production[i])) {
						includesComposition == false;

					}
				}

				if (allTerminals) {
					if (!n.includes(name)) {
						n.push(name);
						changed = true;	
					}
					
				} else if (includesAll) {
					if (!n.includes(name)) {
						n.push(name);
						changed = true;
					}
				} else if (includesComposition) {
					if (!n.includes(name)) {
						n.push(name);
						changed = true;
					}
				}
			}, self.unreachablesFreeCFG);
		}

		// console.log(n);

		productionIterationAltCFG(function(name, production) {
			if ( n.includes(name)) {
				var includesAll = true;

				for (var i = 0; i < production.length; i++) {

					if ( !n.includes(production[i]) ) {
						if ( !Utilities.isTerminal(production[i]))
						{
							if (!(production[i] == EPSILON)) {
								includesAll = false;		
							}
							
						}
						
					}
				}

				if (includesAll) {
					self.addProductionAltCFG(name, production, self.infertileFreeCFG);
				}
				
			}
		}, self.unreachablesFreeCFG);

		return self.infertileFreeCFG;
	}

	this.removeDirectLeftRecursion = function(name) {
		var recursiveProds = [];
		var nonRecursiveProds = []
		for (var i = 0; i < self.leftRecursionFreeCFG[name].length; i++) {
			var prod = self.leftRecursionFreeCFG[name][i];
			if (prod[0] == name) {
				recursiveProds.push(prod);
			} else {
				nonRecursiveProds.push(prod);
			}
		}

		if (recursiveProds.length < 1) {
			return;
		}

		var newNT = name + "'";
		while (self.productions.hasOwnProperty(newNT)) {
			newNT += "'";
		}

		self.leftRecursionFreeCFG[name] = [];
		nonRecursiveProds.map(function(element) {
			var newProd = element.concat(newNT);
			self.leftRecursionFreeCFG[name].push(newProd);
		});

		self.leftRecursionFreeCFG[newNT] = [];
		recursiveProds.map(function(element) {
			var newProd = element.slice(1).concat(newNT);
			self.leftRecursionFreeCFG[newNT].push(newProd);
		})

		self.leftRecursionFreeCFG[newNT].push([Utilities.EPSILON]);

	}

	this.removeLeftRecursion = function() {
		var visitedNT = [];

		for (var name in self.infertileFreeCFG) {
			for (var i = 0; i < self.infertileFreeCFG[name].length; i++) {
				var production = self.infertileFreeCFG[name][i];
				if (Utilities.isNonTerminal(production[0]) && visitedNT.includes(production[0])) {
					var newProductions = [];
					for (var j = 0; j < self.leftRecursionFreeCFG[production[0]].length; j++) {
						newProductions.push(self.leftRecursionFreeCFG[production[0]][j].slice());
					}

					var endOfProd = production.slice(1);

					newProductions.map(function(element) {
						self.addProductionAltCFG(name, element.concat(endOfProd), self.leftRecursionFreeCFG);
					});
				} else {
					self.addProductionAltCFG(name, production, self.leftRecursionFreeCFG);
				}
			}
			visitedNT.push(name);
			self.removeDirectLeftRecursion(name);
		}

		return self.leftRecursionFreeCFG;

	}

	function isEmpty(obj) {
	    for(var key in obj) {
	        if(obj.hasOwnProperty(key))
	            return false;
	    }
	    return true;
	}

	this.leftFactor = function(maxSteps) {
		var factorAgain = false;
		// console.log("---RE----");
		// console.log(self.leftRecursionFreeCFG);
		if (isEmpty(self.factoredCFG)) {
			productionIterationAltCFG(function(name, production) {
				self.addProductionAltCFG(name, production, self.factoredCFG);
			}, self.leftRecursionFreeCFG);
		}


		if (typeof maxSteps !== 'undefined' && maxSteps < 1) {
			return;
		}

		console.log(self.factoredCFG);

		var factorizationInfo = self.getFactorizationInformation(self.factoredCFG);
		for (var name in factorizationInfo.nonFactoredNonTerminals) {
			factorAgain = true;
			if (factorizationInfo.nonFactoredNonTerminals[name] == false) {
				var prods = self.factoredCFG[name].slice();
				self.factoredCFG[name] = [];
				for (var i = 0; i < prods.length; i++) {
					var production = prods[i];
					if ( production ) {
						if (Utilities.isNonTerminal(production[0])) {
							var newProductions = [];
							for (var j = 0; j < self.factoredCFG[production[0]].length; j++) {
								newProductions.push(self.factoredCFG[production[0]][j].slice());
							}

							var endOfProd = production.slice(1);

							newProductions.map(function(element) {
								self.factoredCFG[name].push(element.concat(endOfProd));
							});
						} else {
							self.factoredCFG[name].push(production);
						}
					}

				}
			}
			var prodsByFirstSymbol = {};

			for (var i = 0; i < self.factoredCFG[name].length; i++) {
				var prod = self.factoredCFG[name][i];
				if (!prodsByFirstSymbol[prod[0]]) prodsByFirstSymbol[prod[0]] = [];
				prodsByFirstSymbol[prod[0]].push(prod);
			}

			self.factoredCFG[name] = [];

			for (var firstSymbol in prodsByFirstSymbol) {
				if (prodsByFirstSymbol[firstSymbol].length > 1) {

					var newNT = name + "'";
					while (self.factoredCFG.hasOwnProperty(newNT)) {
						newNT += "'";
					}

					self.factoredCFG[name].push([firstSymbol, newNT]);
					self.factoredCFG[newNT] = [];
					prodsByFirstSymbol[firstSymbol].map(function(e) {
						if (e.length == 1) {
							self.factoredCFG[newNT].push([EPSILON]);
						} else {
							self.factoredCFG[newNT].push(e.slice(1));							
						}
					});
				} else {
					self.factoredCFG[name] = self.factoredCFG[name].concat(prodsByFirstSymbol[firstSymbol]);
				}
			}
		}

		if (factorAgain) {
			if (typeof maxSteps !== 'undefined') {
				if (maxSteps > 1) {
					self.leftFactor(maxSteps - 1);
				}
			} else {
				// No limit
				self.leftFactor();
			}
		}

		return self.factoredCFG;
	}

	this.properCFG = function() {
		// self.epsilonFree();
		// console.log("epsfree")
		// console.log(self.epsilonFreeCFG);
		// console.log("=====================")

		// self.removeSimpleProductions();
		// console.log("simple")
		// console.log(self.cicleFreeCFG);
		// console.log("=====================")
}


	this.stringfyCFG = function(cfg) {
		var str = JSON.stringify(cfg, null, 4);

		str = str.replace(/ /g, "").replace(/:\[\n/g, " -> ")
			.replace(/\[\n/g, "").replace(/\],\n/g, "").replace(/,\n/g, " ")
			.replace(/"\n"/g, " | ").replace(/\]\n/g, "").replace(/"/g, "")
			.replace(/\{/g, "").replace(/\}/g, "");
		return str;
	}



	var lines = cfgStr.split("\n");
	for (var i = 0; i < lines.length; i++) {
		lines[i] = lines[i].trim();
		if (lines[i] == "") {
			lines.splice(i, 1);
			i--;
			continue;
		}

		if (!self.addProductions(lines[i])) {
			throw Utilities.ERROR_INVALID_GRAMMAR;
		}
	}

	if (lines.length == 0) {
		throw Utilities.ERROR_INVALID_GRAMMAR;
	}

	checkConsistency();
	this.string = lines.join("\n");
};

})();
