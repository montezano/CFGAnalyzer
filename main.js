(function(){
"use strict";

var $ = Utilities.$;

if (!Array.prototype.includes) {
	Array.prototype.includes = function(value) {
		return this.indexOf(value) != -1;
	};
}

window.workspace = new Workspace();
var onFileOpen = function(content) {
	workspace.load(content);
	workspace.initEvents();
};

addEventListener("load", function() {
	workspace.initEvents();

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

	$("#regex").addEventListener("keydown", function(ev) {
		if (ev.keyCode == 13) {
			if (workspace.addRegex(this.value)) {
				this.value = "";
			}
		}
	});

	$("#add_btn").addEventListener("click", function() {
		if (workspace.addRegex($("#regex").value)) {
			$("#regex").value = "";
		}
	});
});

})();
