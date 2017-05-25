String.prototype.toHHMMSS = function() {
	var sec_num = parseInt(this / 1000, 10);
	// don't forget the second parameter
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10)
		hours = "0" + hours;
	if (minutes < 10)
		minutes = "0" + minutes;
	if (seconds < 10)
		seconds = "0" + seconds;
	var time = (hours != '00') ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
	return time;
};


! function() {
	require("ti.googlecast");
	var introWindow = require('ui/intro.window')();
	introWindow.addEventListener('open', function() {
		require('ui/main.tabgroup')();
	});
	introWindow.open();
	require('cronservice.trigger')();
}();

function clean(foo) {
	if (foo)
		return foo.replace(/<a.*?>/gim, "").replace(/<\/a>/gim, "")//
		.replace(/&nbsp;/gm, " ")//
		.replace(/<br>\s*<br>\s*/gm, "\n\n")//
		.replace(/<br>/gm, "")//
		.replace(/Erdogan/gm, "Erdoğan")//
		.replace(/Yildirim/gm, "Yıldırım")//
		.replace(/Sofuoglu/gm,"Sofuoğlu")
		.replace(/Cavusoglu/gm, "Çavuşoğlu")//
		.replace(/Isik/gm, "Işık")//
		.replace(/Sislik/gm, "Şişlik")//
		.replace(/&amp;/gm, "&")//
		.replace(/&quot;/gm, "\"")//
		.replace(/Incirlik/gm, "İncirlik")//
		.replace(/`s /gm, "'s ")//
		.replace(/"([^"]+)"/gm, '„$1“');
	else
		return "";
}

