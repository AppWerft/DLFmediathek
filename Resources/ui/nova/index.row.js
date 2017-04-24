module.exports = function(_items) {
	if (_items == null)
		return;
	var dataitems = [];
	return _items.map(function(item) {
		return {
			properties : {
				accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
				itemId : JSON.stringify(item)
			},
			image : {
				image : item.image
			},
			sendung : {
				text : "  "+item.sendung+ " ▶  ︎"
			},
			title : {
				text : item.title
			}
		};
	});

};
