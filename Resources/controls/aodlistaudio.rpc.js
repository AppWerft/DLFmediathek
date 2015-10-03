var parseNode = function(itemNode) {
	var entry = {};
	var entry = {
		station : itemNode.getElementsByTagName('station').item(0).getTextContent().toLowerCase(),
		title : itemNode.getElementsByTagName('title').item(0).getTextContent(),
		author : itemNode.getElementsByTagName('author').item(0).getTextContent(),
		sendung : itemNode.getElementsByTagName('sendung').item(0).getTextContent(),
		datetime : itemNode.getElementsByTagName('datetime').item(0).getTextContent(),
	};
	if (itemNode.hasAttributes()) {
		var attributes = itemNode.getAttributes();
		entry.url = attributes.getNamedItem('url') ? attributes.getNamedItem('url').nodeValue : null;
		entry.duration = attributes.getNamedItem('duration').nodeValue;
	}
	return entry;
};

exports.parseXMLDoc = function(xml) {
	var entries = [];
	var itemsNodelist = xml.getElementsByTagName("item");
	var length = itemsNodelist.getLength();
	if (length !== 0) {
		for (var nodelistindex = 0; nodelistindex < length; nodelistindex++) {
			entries.push(parseNode(itemsNodelist.item(nodelistindex)));
		}
	} else
		console.log('Warning: items are null');
	return entries;
};
