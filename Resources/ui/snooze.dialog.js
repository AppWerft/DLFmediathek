var durations = [10, 15, 30, 45, 60, 120, 0];
module.exports = function(_cb) {
	var $ = Ti.UI.createOptionDialog({
		title : "automatische Abschaltung",
		options : ["10 min.", "15 min.", "30 min.", "45 min.", "1 Stunde", "2 Stunden", "ohne Abschaltung"]
	});
	$.addEventListener("click", function(e) {
		if (_cb)
			_cb(durations[e.index] * 60 * 1000);
	});
	$.show();
};
