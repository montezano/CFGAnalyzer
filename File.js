(function(){
"use strict";

var DEFAULT_FILE_NAME = "er.txt";

var textFile = null;
var downloadLink = null;

window.File = {
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
		if (window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(blob, DEFAULT_FILE_NAME);
		} else {
			downloadLink.click();
		}
	},
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
