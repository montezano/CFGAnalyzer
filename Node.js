(function(){
"use strict";

var alphabet = ["&"];
for (var code = 65; code < 65 + 26; code++) {
	alphabet.push(String.fromCharCode(code).toLowerCase());
}
for (var i = 0; i < 10; i++) {
	alphabet.push(i + "");
}

// Structure:
// "operator": [number of operands, priority]
var operatorInfo = {
	"?": [1, 3],
	"*": [1, 3],
	"+": [1, 3],
	"|": [2, 1],
	".": [2, 2]
};

var operators = Object.keys(operatorInfo);

var numOperands = function(operator) {
	return operatorInfo[operator][0];
};

var priority = function(operator) {
	return operatorInfo[operator][1];
};

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
			if (numOperands(self.data) != 2) {
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
			if (numOperands(self.data) != 2) {
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
			self.priority = priority(char);
			self.data = char;
			return;
		}

		if (self.isOperator && self.right === null && numOperands(self.data) == 2) {
			var node = new Node();
			node.push(char);
			node.parent = self;
			self.right = node;
			return;
		}

		if (!self.isOperator || self.priority >= priority(char)) {
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

		if (self.priority < priority(char)) {
			self.right.push(char);
			return;
		}

		console.log("Error: invalid regex");
	}

	this.push = function(char) {
		// console.log("Pushing " + char);
		if (char instanceof Node) {
			pushSubtree(char);
		} else if (alphabet.includes(char)) {
			pushTerminal(char);
		} else if (operators.includes(char)) {
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

	this.root = function() {
		var node = self;
		while (node.parent !== null) {
			node = node.parent;
		}
		return node;
	};

	this.debug = function() {
		if (self.left !== null) {
			self.left.debug();
		}

		var str = self.data;
		if (self.isOperator) {
			str += " (";
			str += (self.left === null) ? "none" : "'" + self.left.data + "'";
			str += ", ";
			str += (self.right === null) ? "none" : "'" + self.right.data + "'";
			str += ")";
		}

		if (self.parent === null) {
			str += " [ROOT]";
		}
		console.log(str);

		if (self.right !== null) {
			self.right.debug();
		}
 	};
};

})();