(function(){
"use strict";

var $ = function(selector) {
	return document.querySelectorAll(selector);
};

// TODO: decidir o idioma da documentação
var onFileOpen = function(content) {
	// TODO
	console.log(content);
};

addEventListener("load", function() {

	$("#save")[0].addEventListener("click", function(ev) {
		// TODO
		Utilities.save("Hello, world!");
	});

	$("#file_selector")[0].addEventListener("change", function(ev) {
		var file = ev.target.files[0];
		Utilities.open(file, onFileOpen);
	});

});

})();
