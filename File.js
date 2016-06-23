(function(){
"use strict";

var DEFAULT_FILE_NAME = "er.txt";

var textFile = null;
var downloadLink = null;

window.File = {
	// Saves a given content in a file
	save: function(content) {
		var blob = new Blob([content], {type: "application/text;charset=utf-8"});
		if (window.navigator.msSaveBlob) {
			// Support for Internet Explorer
			window.navigator.msSaveBlob(blob, DEFAULT_FILE_NAME);
			return;
		}

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
	// Opens a file and then calls a callback function passing the content to it.
	open: function(file, callback) {
		if (file) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(e.target.result);
			};
			reader.readAsText(file);
		}
	}
};

})();
