module.exports = function(searchMenu,where) {
	var $ = Ti.UI.Android.createSearchView({
		hintText : "Suche"
	});
	$.addEventListener('submit', function(_e) {
	require('ui/search.window')({
		needle : _e.source.value,
		where : where
	}).open();
	searchMenu.collapseActionView();
});
	return $;
};
