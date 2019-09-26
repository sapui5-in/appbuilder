module.exports = {

		getCode: function(iaCode) {
			if (iaCode && iaCode.length) {
				var laI18n = [];
				for (var i=0;i<iaCode.length;i++) {
					laI18n.push(iaCode[i].key + "=" + iaCode[i].text);
				}

				return laI18n;
			} else {
				return [];
			}
		}
};