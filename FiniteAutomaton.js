(function(){
"use strict";

var ERROR_STATE = "φ";

window.FiniteAutomaton = function() {
	var self = this;
	this.stateList = [];
	this.transitions = {};
	this.initialState = null;
	this.acceptingStates = [];

	// Null represents the error state.
	this.currentState = null;

	// Adds a new state to this automaton and marks it as the initial state
	// if there's none.
	this.addState = function(state) {
		if (!self.stateList.includes(state)) {
			self.stateList.push(state);
			if (self.initialState === null) {
				self.initialState = state;
				self.currentState = state;
			}
		}
	};

	// Adds a group of states to this automaton, marking the first as the
	// initial state if there's none.
	this.addStates = function(/*...args*/) {
		for (var i = 0; i < arguments.length; i++) {
			self.addState(arguments[i]);
		}
	};

	// Removes a state of this automaton, also removing all transitions
	// involving it.
	this.removeState = function(state) {
		// console.log("[REMOVE] " + state);
		if (self.stateList.includes(state)) {
			for (var source in self.transitions) {
				if (!self.transitions.hasOwnProperty(source)) continue;
				if (source == state) {
					delete self.transitions[source];
					continue;
				}
				for (var input in self.transitions[source]) {
					if (!self.transitions[source].hasOwnProperty(input)) continue;
					var target = self.transitions[source][input][0];
					if (target == state) {
						delete self.transitions[source][input];
					}
				}
				if (Object.keys(self.transitions[source]).length == 0) {
					delete self.transitions[source];
				}
			}

			self.stateList.splice(self.stateList.indexOf(state), 1);
			if (self.acceptingStates.includes(state)) {
				self.acceptingStates.splice(self.acceptingStates.indexOf(state), 1);
			}

			if (self.initialState == state) {
				self.initialState = null;
			}

			if (self.currentState == state) {
				self.currentState = null;
			}
		}
	};

	// Makes all transitions that lead to a state go to another state
	this.replaceState = function(oldState, newState) {
		for (var source in self.transitions) {
			if (!self.transitions.hasOwnProperty(source)) continue;
			for (var input in self.transitions[source]) {
				if (!self.transitions[source].hasOwnProperty(input)) continue;
				var target = self.transitions[source][input][0];
				if (target == oldState) {
					self.transitions[source][input][0] = newState;
				}
			}
		}
	};

	// Adds a new accepting state to this automaton.
	this.acceptState = function(state) {
		if (self.stateList.includes(state)) {
			self.acceptingStates.push(state);
		}
	};

	// Adds a transition to this automaton.
	this.addTransition = function(currState, input, targetState) {
		if (self.stateList.includes(currState) && self.stateList.includes(targetState)) {
			if (!self.transitions.hasOwnProperty(currState)) {
				self.transitions[currState] = {};
			}

			if (!self.transitions[currState].hasOwnProperty(input)) {
				self.transitions[currState][input] = [];
			}

			if (!self.transitions[currState][input].includes(targetState)) {
				self.transitions[currState][input].push(targetState);
			}
		}
	};

	// Resets all this automaton's state names according to the
	// naming convention (uses Utilities::generateStateName)
	// Note that this might fail if there's a state already following
	// the usual naming conventions, as it is designed and optimized to work
	// specifically with the intersection method, in which that never occurs.
	this.renameStates = function() {
		var mapping = {};
		for (var i = 0; i < self.stateList.length; i++) {
			var state = self.stateList[i];
			var newName = Utilities.generateStateName(i);
			self.replaceState(state, newName);
			self.transitions[newName] = self.transitions[state];
			delete self.transitions[state];
			self.stateList[i] = newName;
			mapping[state] = newName;
		}

		for (var i = 0; i < self.acceptingStates.length; i++) {
			self.acceptingStates[i] = mapping[self.acceptingStates[i]];
		}

		if (self.initialState) {
			self.initialState = mapping[self.initialState];
		}

		if (self.currentState) {
			self.currentState = mapping[self.currentState];
		}
	};

	// Reads a char as input, changing the state of this automaton if there's
	// a valid transition.
	this.read = function(input) {
		if (input == null) return;
		input = input.toString();
		var length = input.length;
		if (length < 1) return;
		if (length > 1) {
			for (var i = 0; i < length; i++) {
				self.read(input[i]);
			}
			return;
		}

		if (self.stateList.length == 0) return;
		if (self.initialState === null || self.currentState === null) return;

		if (!self.transitions.hasOwnProperty(self.currentState)
			|| !self.transitions[self.currentState].hasOwnProperty(input)) {
			self.currentState = null;
			return;
		}
		// FIXME: if we need to handle non-determinism this will need to be changed.
		self.currentState = self.transitions[self.currentState][input][0];
	};

	// Returns to the initial state.
	this.reset = function() {
		self.currentState = self.initialState;
	};

	// Checks if this automaton is on an accepting state.
	this.accepts = function() {
		return self.acceptingStates.includes(self.currentState);
	};

	// Returns the sorted alphabet of this automaton, based on its
	// existing transitions.
	this.getAlphabet = function() {
		var transitions = self.transitions;
		var alphabet = [];
		for (var state in transitions) {
			if (transitions.hasOwnProperty(state)) {
				for (var i in transitions[state]) {
					if (transitions[state].hasOwnProperty(i)) {
						if (!alphabet.includes(i)) {
							alphabet.push(i);
						}
					}
				}
			}
		}
		alphabet.sort();
		return alphabet;
	};

	// Returns a list containing all the non-final states of this automaton.
	this.getRejectingStates = function() {
		var rejectingStates = [];
		for (var i = 0; i < self.stateList.length; i++) {
			if (!self.acceptingStates.includes(self.stateList[i])) {
				rejectingStates.push(self.stateList[i]);
			}
		}
		return rejectingStates;
	};

	// Returns a copy of this automaton.
	this.copy = function() {
		var result = new FiniteAutomaton();
		for (var i = 0; i < self.stateList.length; i++) {
			result.addState(self.stateList[i]);
		}

		for (var state in self.transitions) {
			if (!self.transitions.hasOwnProperty(state)) continue;
			var t = self.transitions[state];
			for (var input in t) {
				if (!t[input]) continue;
				for (var i = 0; i < t[input].length; i++) {
					result.addTransition(state, input, t[input][i]);
				}
			}
		}

		for (var i = 0; i < self.acceptingStates.length; i++) {
			result.acceptState(self.acceptingStates[i]);
		}
		result.initialState = self.initialState;
		result.currentState = self.currentState;
		return result;
	};

	// Removes all dead states of this automaton.
	this.removeDeadStates = function() {
		var i = 0;
		while (i < self.stateList.length) {
			var state = self.stateList[i];
			var accessibleStates = self.getAccessibleStates(state);
			var dead = true;
			for (var j = 0; j < accessibleStates.length; j++) {
				if (self.acceptingStates.includes(accessibleStates[j])) {
					dead = false;
					break;
				}
			}
			if (dead) {
				self.removeState(state);
			} else {
				i++;
			}
		}
	};

	// Returns a list containing all accessible states of this automaton
	// starting in an optionally given state. If no state is provided,
	// the initial state is used.
	this.getAccessibleStates = function(startingState) {
		if (startingState == null) {
			startingState = self.initialState;
		}
		var accessibleStates = [startingState];
		for (var i = 0; i < accessibleStates.length; i++) {
			var state = accessibleStates[i];
			for (var input in self.transitions[state]) {
				if (self.transitions[state].hasOwnProperty(input)) {
					var target = self.transitions[state][input][0];
					if (!accessibleStates.includes(target)) {
						accessibleStates.push(target);
					}
				}
			}
		}
		return accessibleStates;
	};

	// Removes all inacessible states of this automaton.
	this.removeInaccessibleStates = function() {
		var accessibleStates = self.getAccessibleStates();
		var i = 0;
		while (i < self.stateList.length) {
			var state = self.stateList[i];
			if (!accessibleStates.includes(state)) {
				self.removeState(state);
			} else {
				i++;
			}
		}
	};

	// Removes all useless states of this automaton.
	this.removeUselessStates = function() {
		self.removeDeadStates();
		self.removeInaccessibleStates();
	};

	// Returns the subset of states of this automaton which has a transition
	// on a given input leading to a state in a given set.
	this.stateFilter = function(input, set) {
		var result = [];
		for (var i = 0; i < self.stateList.length; i++) {
			var state = self.stateList[i];
			if (self.transitions.hasOwnProperty(state)
				&& self.transitions[state].hasOwnProperty(input)
				&& set.includes(self.transitions[state][input][0])) {
				result.push(state);
			}
		}
		return result;
	};

	// Replaces all undefined transitions by transitions to the error state.
	this.materializeErrorState = function() {
		var alphabet = self.getAlphabet();
		var transitions = self.transitions;
		var materialized = false;
		for (var i = 0; i < self.stateList.length; i++) {
			var state = self.stateList[i];
			for (var j = 0; j < alphabet.length; j++) {
				if (!transitions.hasOwnProperty(state)
					|| !transitions[state].hasOwnProperty(alphabet[j])) {
					if (!materialized) {
						self.addState(ERROR_STATE);
						materialized = true;
					}
					self.addTransition(state, alphabet[j], ERROR_STATE);
				}
			}
		}
	};

	// Removes all equivalent states of this automaton using Hopcroft's algorithm.
	this.removeEquivalentStates = function() {
		self.materializeErrorState();
		var alphabet = self.getAlphabet();
		var partitions = [self.acceptingStates, self.getRejectingStates()];
		// TODO: find a good name for this variable
		var w = [self.acceptingStates];
		while (w.length > 0) {
			var set = w.pop();
			for (var i = 0; i < alphabet.length; i++) {
				var c = alphabet[i];
				var predecessors = self.stateFilter(c, set);
				var j = 0;
				while (j < partitions.length) {
					var partition = partitions[j];
					var intersection = Utilities.intersection(partition, predecessors);
					var difference = Utilities.subtract(partition, predecessors);
					if (intersection.length > 0 && difference.length > 0) {
						partitions.splice(j, 1);
						partitions.push(intersection);
						partitions.push(difference);
						var index = Utilities.indexOf(w, partition);
						if (index >= 0) {
							w.splice(index, 1);
							w.push(intersection);
							w.push(difference);
						} else {
							if (intersection.length <= difference.length) {
								w.push(intersection);
							} else {
								w.push(difference);
							}
						}
					} else {
						j++;
					}
				}
			}
		}

		for (var i = 0; i < partitions.length; i++) {
			// console.log(partitions[i].join(","));
			while (partitions[i].length > 1) {
				var state = partitions[i].pop();
				self.replaceState(state, partitions[i][0]);
				self.removeState(state);
			}
		}
		self.removeState(ERROR_STATE);
	};

	// Returns the minimized form of this automaton.
	this.minimize = function() {
		var result = self.copy();
		result.removeUselessStates();
		result.removeEquivalentStates();
		return result;
	};

	// Returns a new automaton whose recognized language is the complement
	// of this one.
	this.complement = function() {
		self.materializeErrorState();
		var result = new FiniteAutomaton();
		for (var i = 0; i < self.stateList.length; i++) {
			var state = self.stateList[i];
			result.addState(state);
			if (!self.acceptingStates.includes(state)) {
				result.acceptState(state);
			}
		}
		result.initialState = self.initialState;
		result.transitions = self.transitions;
		return result;
	};

	// Returns a new automaton whose recognized language is the union
	// between this and another automaton's languages.
	// TODO: this can probably be removed since the intersection algorithm
	// no longer uses it.
	/*this.union = function(other) {
		if (other instanceof FiniteAutomaton) {
			var result = new FiniteAutomaton();
			// TODO
			return result;
		}
		return self;
	};*/

	// Returns a new automaton whose recognized language is the intersection
	// between this and another automaton's languages.
	// Uses the product construction to obtain the intersection
	// http://cs.stackexchange.com/questions/6893/is-this-intersection-of-dfas-correct
	// TODO: remove the link above when the implementation is complete.
	this.intersection = function(other) {
		var result = new FiniteAutomaton();
		if (other instanceof FiniteAutomaton) {
			self.materializeErrorState();
			other.materializeErrorState();
			var pairs = Utilities.cartesianProduct(self.stateList, other.stateList);
			var acceptingPairs = Utilities.cartesianProduct(self.acceptingStates,
															other.acceptingStates);
			var alphabet = Utilities.union(self.getAlphabet(), other.getAlphabet());
			for (var i = 0; i < pairs.length; i++) {
				result.addState(pairs[i].join(""));
			}

			for (var i = 0; i < pairs.length; i++) {
				var state = pairs[i].join("");
				var transitions1 = self.transitions[pairs[i][0]];
				var transitions2 = other.transitions[pairs[i][1]];
				for (var j = 0; j < alphabet.length; j++) {
					var target1 = (transitions1.hasOwnProperty(alphabet[j]))
								  ? transitions1[alphabet[j]][0]
								  : ERROR_STATE;
					var target2 = (transitions2.hasOwnProperty(alphabet[j]))
								  ? transitions2[alphabet[j]][0]
								  : ERROR_STATE;
					result.addTransition(state, alphabet[j], target1 + target2);
				}
			}

			for (var i = 0; i < acceptingPairs.length; i++) {
				result.acceptState(acceptingPairs[i].join(""));
			}

			result.initialState = self.initialState + other.initialState;
			result.renameStates();
		}
		return result;
	};

	// Checks if this automaton doesn't accept any expression.
	this.isEmpty = function() {
		var minimized = self.minimize();
		return (minimized.acceptingStates.length == 0);
	};

	// Checks if this automaton's regular language contains another
	// automaton's regular language.
	this.contains = function(other) {
		if (other instanceof FiniteAutomaton) {
			return self.intersection(other.complement()).isEmpty();
		}
		return false;
	};

	// Checks if this automaton is equivalent to another one.
	this.isEquivalentTo = function(other) {
		if (other instanceof FiniteAutomaton) {
			return self.contains(other) && other.contains(self);
		}
		return false;
	};

	this.debug = function() {
		console.log("Current State: "  + self.currentState);
		console.log("Is accepting: " + (self.accepts() ? "Yes" : "No"));
		console.log("States: [" + self.stateList.join(", ") + "]");
		console.log("Initial State: " + self.initialState);
		console.log("Accepting States: [" + self.acceptingStates.join(", ") + "]");
		console.log("Transitions:");
		for (var currState in self.transitions) {
			if (self.transitions.hasOwnProperty(currState)) {
				var transitions = self.transitions[currState];
				for (var input in transitions) {
					if (transitions.hasOwnProperty(input)) {
						console.log("(" + currState + ", " + input + ") -> " + transitions[input][0]);
					}
				}
			}
		}
	};
};

})();