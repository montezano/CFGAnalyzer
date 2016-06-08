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

	function pushSubtree(tree) {
		// console.log("Pushing subtree...");
		if (self.data === null) {
			self.isOperator = tree.isOperator;
			self.priority = tree.priority;
			self.data = tree.data;
			self.left = tree.left;
			self.right = tree.right;
			return;
		}

		if (!self.isOperator) {
			console.log("Error: invalid regex");
			return;
		}

		if (self.right === null) {
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

		if (self.right === null) {
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

		if (self.isOperator && self.right === null && Utilities.numOperands(self.data) == 2) {
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

		if (self.priority <= priority(char)) {
			self.right.push(char);
			return;
		}

		console.log("Error: invalid regex");
	}

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

	this.changePriority = function(delta) {
		if (self.left !== null) {
			self.left.changePriority(delta);
		}

		if (self.isOperator) {
			self.priority += delta;
		}

		if (self.right !== null) {
			self.right.changePriority(delta);
		}
	};

	this.isValid = function() {
		// TODO
		return true;
	};

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
		console.log('-' + Array(indent).join('--'), self.data);
    	if (self.left !== null) self.left.debugHelper(indent + 1);
    	if (self.right !== null) self.right.debugHelper(indent + 1);
	};
};

})();