const prettifyXml = require('prettify-xml');
const options = {indent: 2, newline: '\n'};

module.exports = {
		getXml: function(isXml) {
			if (isXml) {
				return prettifyXml(isXml, options);
			}
		}
};