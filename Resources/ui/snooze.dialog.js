var durations = [10, 15, 30, 45, 60, 120, 0];
module.exports = function(_cb) {

	var $ = Ti.UI.createOptionDialog({
		title : "automatische Verschlummerung",
		options : ["10 min.", "15 min.", "30 min.", "1 Stunde", "2 Stunden", "ohne Abschaltung"]
	});
	var timer = setTimeout(function() {
		$.fireEvent("click", {
			index : -1
		});

	}, 10000);
	$.addEventListener("click", function(e) {
		clearTimeout(timer);
		if (_cb)
			_cb(durations[e.index] * 60 * 1000);

	});
	$.show();
};
