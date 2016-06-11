(function(){
"use strict";

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
	}


	// Returns the minimized form of this automaton.
	this.minimize = function() {
		var result = new FiniteAutomaton();
		// TODO
		return result;
	};

	// Returns a new automaton whose recognized language is the complement
	// of this one.
	// TODO: handle the error state
	this.complement = function() {
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
	this.union = function(other) {
		if (other instanceof FiniteAutomaton) {
			var result = new FiniteAutomaton();
			// TODO
			return result;
		}
		return self;
	};

	// Returns a new automaton whose recognized language is the intersection
	// between this and another automaton's languages.
	// Uses the property M1 intersec M2 = not(not(M1) union not(M2))
	this.intersection = function(other) {
		var result = new FiniteAutomaton();
		if (other instanceof FiniteAutomaton) {
			var c1 = self.complement();
			var c2 = other.complement();
			return c1.union(c2).complement();
		}
		return result;
	};

	// Checks if this automaton doesn't accept any expression.
	this.isEmpty = function() {
		// TODO
		return false;
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