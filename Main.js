(function(){
"use strict";

var $ = Utilities.$;

// Internet Explorer doesn't support array.includes() and string.startsWith()
if (!Array.prototype.includes) {
	Array.prototype.includes = function(value) {
		return this.indexOf(value) != -1;
	};
}

if (!String.prototype.startsWith) {
	String.prototype.startsWith = function(str) {
		return this.substr(0, str.length) == str;
	};
}

if (!Array.prototype.split) {
	Array.prototype.split = function(separator) {
		var outArray = [];

		var lastIndex = 0;
		for (var i = 0; i < this.length; i++) {
			if (this[i] == separator) {
				outArray.push(this.slice(lastIndex, i));
				lastIndex = i+1;
			}
		}

		if (lastIndex != 0) {
			outArray.push(this.slice(lastIndex, i));
		} else {
			return [this];
		}

		return outArray;
	};
}

	if (!Array.prototype.splitFirst) {
		Array.prototype.splitFirst = function(separator) {
			var outArray = [];

			var separatorIndex = this.indexOf(separator);
			outArray.push(this.slice(0, separatorIndex));
			outArray.push(this.slice(separatorIndex+1));

			return outArray;
		};
	}

window.workspace = new Workspace();
var onFileOpen = function(content) {
	workspace.load(content);
};

addEventListener("load", function() {
	$("#file_selector").addEventListener("change", function(ev) {
		var file = ev.target.files[0];
		File.open(file, onFileOpen);
	});

	$("#open").addEventListener("click", function() {
		$("#file_selector").click();
	});

	$("#save").addEventListener("click", function() {
		File.save(workspace.toString());
	});

	$("#analyze_btn").addEventListener("click", function() {
		if (workspace.setCFG($("#cfg").value)) {
			$("#cfg").value = "";
		}
	});
});

})();
