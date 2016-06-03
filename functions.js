(function(){
"use strict";

var DEFAULT_FILE_NAME = "er.txt";

var textFile = null;
var downloadLink = null;

var $ = function(selector) {
	return document.querySelectorAll(selector);
}

var Utilities = {
	save: function(content) {
		var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
		if (textFile !== null) {
			URL.revokeObjectURL(textFile);
		}
		textFile = URL.createObjectURL(blob);

		if (downloadLink === null) {
			downloadLink = document.createElement("a");
			downloadLink.download = DEFAULT_FILE_NAME;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}
		downloadLink.href = textFile;
		downloadLink.click();
	},
	load: function(content) {
		// TODO
		console.log(content);
	}
};

addEventListener("load", function() {

	$("#save")[0].addEventListener("click", function(ev) {
		// TODO
		Utilities.save("Hello, world!");
	});

	$("#file_selector")[0].addEventListener("change", function(ev) {
		var file = ev.target.files[0];
		if (file) {
			var reader = new FileReader();
			reader.onload = function(e) {
				Utilities.load(e.target.result);
			};
			reader.readAsText(file);
		}
	});

});

})();
