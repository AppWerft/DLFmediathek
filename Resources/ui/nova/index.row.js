module.exports = function(_items, _color) {
	if (_items == null)
		return;
	var dataitems = [];
	return _items.map(function(item) {
		if (!_color) {
			_color = item.color;
		}
		return {
			properties : {
				accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
				itemId : JSON.stringify(item)
			},
			image : {
				image : item.image
			},
			strip : {
				backgroundColor : _color.replace("#", "#80")
			},
			play : {
				color : _color.replace("#", "#80")
			},
			sendung : {
				text : "  " + item.sendung + " ▶  ︎"
			},
			title : {
				text : item.title
			}
		};
	});

};
