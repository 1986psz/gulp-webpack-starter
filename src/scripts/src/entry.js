//jQuery plugin sample syntax
//require('./vendors/bootstrap.min.js');

var content = require('./content.js');

$('#wrapper').append(
    $('<h3>').text('jQuery test'),
	content.el1,
    content.el2
); 