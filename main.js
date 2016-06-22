(function(){
"use strict";

var $ = Utilities.$;

window.workspace = new Workspace();
var onFileOpen = function(content) {
	workspace.load(content);
	workspace.initEvents();
};

addEventListener("load", function() {
	workspace.initEvents();
	// workspace.addRegex("a(cd)*|b(cd)*");
	// workspace.addRegex("(a|b)(cd)*");
	//workspace.addRegex("aaababbcaabcbacbabcbabcaaababbcaabcbacbabcbabc");

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

	$("#regex").addEventListener("keyup", function(ev) {
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
