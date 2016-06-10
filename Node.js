(function(){
"use strict";

window.Node = function() {
	var self = this;
	this.isOperator = false;
	this.priority = 0;
	this.data = null;
	this.left = null;
	this.right = null;
	this.parent = null;
	this.threadingLink = null;
	this.index = null;

	this.override = function(oldTree, newTree) {
		if (self.parent == oldTree) {
			self.parent = newTree;
		}

		if (self.left) {
			if (self.left == oldTree) {
				self.left = newTree;
			} else {
				self.left.override(oldTree, newTree);
			}
			if (self.left.parent == oldTree) self.left.parent = newTree;
		}

		if (self.right) {
			if (self.right == oldTree) {
				self.right = newTree;
			} else {
				self.right.override(oldTree, newTree);
			}
			if (self.right.parent == oldTree) self.right.parent = newTree;
		}
	}

	function pushSubtree(tree) {
		// console.log("Pushing subtree...");
		if (self.data === null) {
			self.isOperator = tree.isOperator;
			self.priority = tree.priority;
			self.data = tree.data;
			self.left = tree.left;
			self.right = tree.right;
			self.index = tree.index;
			self.override(tree, self);
			return;
		}

		if (!self.isOperator) {
			console.log("Error: invalid regex");
			return;
		}

		if (!self.right) {
			if (Utilities.numOperands(self.data) != 2) {
				console.log("Error: invalid regex");
				return;
			}
			self.right = tree;
			self.right.parent = self;
		} else {
			self.right.push(tree);
		}
	}

	function pushTerminal(char) {
		// console.log("Terminal: " + char);
		if (self.data === null) {
			self.data = char;
			return;
		}

		if (!self.isOperator) {
			console.log("Error: invalid regex");
			return;
		}

		if (!self.right) {
			if (Utilities.numOperands(self.data) != 2) {
				console.log("Error: invalid regex");
				return;
			}
			self.right = new Node();
			self.right.parent = self;
		}
		self.right.push(char);
	}

	function pushOperator(char) {
		// console.log("Operator: " + char);
		if (self.data === null) {
			self.isOperator = true;
			self.priority = Utilities.priority(char);
			self.data = char;
			return;
		}

		if (self.isOperator && !self.right && Utilities.numOperands(self.data) == 2) {
			var node = new Node();
			node.push(char);
			node.parent = self;
			self.right = node;
			return;
		}

		if (!self.isOperator || self.priority > Utilities.priority(char)) {
			var node = new Node();
			node.push(char);
			node.parent = self.parent;
			node.left = self;
			if (self.parent !== null) {
				if (self.parent.left == this) {
					self.parent.left = node;
				} else {
					self.parent.right = node;
				}
			}
			self.parent = node;
			return;
		}

		if (self.priority <= Utilities.priority(char)) {
			self.right.push(char);
			return;
		}

		console.log("Error: invalid regex");
	}

	// Pushes a new symbol to the tree.
	this.push = function(char) {
		// console.log("Pushing " + char);
		if (char instanceof Node) {
			pushSubtree(char);
		} else if (Utilities.alphabet.includes(char)) {
			pushTerminal(char);
		} else if (Utilities.operators.includes(char)) {
			pushOperator(char);
		} else {
			console.log("Warning: unknown character \"" + char + "\"");
		}
	};

	// Changes the priority of all the operators in this tree by a given amount.
	this.changePriority = function(delta) {
		if (self.left) {
			self.left.changePriority(delta);
		}

		if (self.isOperator) {
			self.priority += delta;
		}

		if (self.right) {
			self.right.changePriority(delta);
		}
	};

	// Checks if this tree is valid.
	this.isValid = function() {
		if (self.data === null) {
			// null trees are not valid
			return false;
		}

		if (self.left && !self.left.isValid()) return false;
		if (self.right && !self.right.isValid()) return false;
		if (self.isOperator) {
			if (!self.left) return false;
			if (!self.right && Utilities.numOperands(self.data) == 2) {
				return false;
			}
		}

		return true;
	};

	// Adds the threading links to all nodes in this subtree.
	// A null threading link represents the lambda.
	this.setThreadingLinks = function() {
		if (self.left) {
			var leftLink = self.left.setThreadingLinks();
			leftLink.threadingLink = self;
		}

		if (self.right) {
			return self.right.setThreadingLinks();
		}
		return self;
	};

	this.setTerminalIndexes = function(valueContainer) {
		if (valueContainer == null) valueContainer = { index: 1 };
		if (!self.isOperator) {
			self.index = valueContainer.index++;
		}

		if (self.left) {
			self.left.setTerminalIndexes(valueContainer);
		}

		if (self.right) {
			self.right.setTerminalIndexes(valueContainer);
		}
	};

	this.searchByIndex = function(index) {
		index *= 1;
		if (isNaN(index)) return null;

		if (self.index == index) {
			return this;
		}

		var node = null;
		if (self.left) node = self.left.searchByIndex(index);
		if (self.right) node = node || self.right.searchByIndex(index);
		return node;
	};

	// Returns the root of this tree.
	this.root = function() {
		var node = self;
		while (node.parent !== null) {
			node = node.parent;
		}
		return node;
	};

	this.debug = function() {
		self.debugHelper(1);
 	};

	this.debugHelper =  function(indent) {
		var threadingLink = self.threadingLink;
		if (!threadingLink) {
			threadingLink = new Node();
			threadingLink.data = "lambda";
		}
		console.log('-' + Array(indent).join('--'), self.data + " (" + threadingLink.data + ")");
		if (self.left !== null) self.left.debugHelper(indent + 1);
		if (self.right !== null) self.right.debugHelper(indent + 1);
	};
};

Node.LAMBDA_INDEX = -1;

})();