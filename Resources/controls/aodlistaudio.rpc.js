exports.parseXMLDoc = function(xml) {
	var entries = [];
	var itemsNodelist = xml.getElementsByTagName("item");
	var length = itemsNodelist.getLength();
	if (length) {
		console.log('Length: ' + length);
		for (var nodelistindex = 0; nodelistindex < length; nodelistindex++) {
			var entry = {};
			var itemNode = itemsNodelist.item(nodelistindex);
			if (!itemNode) {
				console.log(itemNode);
				break;
			}
			console.log(itemNode.apiName);
			if (itemNode.hasAttributes()) {
				var attributes = itemNode.getAttributes();
				entry.url = attributes.getNamedItem('url').nodeValue;
				entry.timestamp = attributes.getNamedItem('timestamp').nodeValue;
				entry.duration = attributes.getNamedItem('duration').nodeValue;
			}
			if (itemNode.hasChildNodes()) {
				var childNodes = itemNode.getChildNodes();
				if ( length = childNodes.getLength()) {
					for (var j = 0; j < length; j++) {
						var item = childNodes.item(j);
						if (item.apiName == 'Ti.XML.Element') {
							//			console.log('KEY="' + item.getNodeName() + '"');
							//		console.log('VAL="' + item.getTextContent() + '"');
							entry[item.getNodeName()] = item.getTextContent();
						}
					}
				}
			}
			entries.push(entry);
		}

	}
	console.log('Lafter ' + entries.length);
	return entries;
};
