module.exports = function(device,dark) {
	var row = Ti.UI.createTableViewRow({
		itemId: JSON.stringify(device)
	});
	try {
	var title = (device.dnstype=="googlecast") ? device.txt.md + "@" +  device.txt.fn : device.txt.model;
	var name = (device.dnstype=="googlecast") ? device.txt.md.toLowerCase() : device.txt.model.toLowerCase();
	} catch(E) {
		title= device.name;
		name = device.name.toLowerCase();
	}
	row.add(Ti.UI.createLabel({
		top : 10,
		text : title,
		color : dark ? '#ddd':'#333',
		textAlign : 'left',
		width: Ti.UI.FILL,
		left : 120,
		opacity :  0.5,
		font : {
			fontSize : 20,
			fontFamily : "Aller bold"
		}
	}));
	row.add(Ti.UI.createImageView({
		top : 10,
		left : 20,
		opacity :  0.5,
		image : "/images/" + name + ".png",
		height : 45
	}));
	row.add(Ti.UI.createLabel({
		top : 40,
		text : device.ip + ":" + device.port + "\n",
		color : '#777',
		textAlign : 'left',
		width: Ti.UI.FILL,
		opacity :  0.5,
		left : 120,
		font : {
			fontSize : 10,
			fontFamily : "DroidSans"
		}
	}));
	var switcher = Ti.UI.createSwitch({
		value : false, // mandatory property for iOS
		style : Ti.UI.Android.SWITCH_STYLE_SWITCH,
		right : 10,
		bottom : 10
	});
	switcher.addEventListener("click",function(){
		Ti.UI.createNotification({message:"Noch nicht implementiert"}).show();
	});
 	row.add(switcher);
	return row;
};
