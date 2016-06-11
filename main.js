(function(){
"use strict";

var $ = Utilities.$;

var workspace = new Workspace();
var onFileOpen = function(content) {
	workspace = Workspace.load(content);
};

addEventListener("load", function() {
	workspace.addRegex("ab*c");
	workspace.addRegex("ac+");	
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
			var value = this.value;
			this.value = "";
			workspace.addRegex(value);
		}
	});
});

})();
