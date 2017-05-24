module.exports = function(items) {
	return items.map(function(_item, _ndx) {
		return {
			properties : {
				accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
				itemId : _item.link
			},
			title : {
				text : _item.title
			},
			shorttext : {
				text : _item.shorttext
			},
			pubtime : {
				text : _item.cTime
			},
			aufmacher : {
				image : _item.aufmacher || undefined
			}
		};
	});
};
