module.exports = function(route,dark) {
	var row = Ti.UI.createTableViewRow({
		itemId: JSON.stringify(route)
	});
	row.add(Ti.UI.createLabel({
		top : 10,
		text : route.getDescription(),
		opacity :  0.7,
		color : dark ? '#ddd':'#333',
		textAlign : 'left',
		width: Ti.UI.FILL,
		left : 90,
		font : {
			fontSize : 20,
			fontFamily : "Aller bold"
		}
	}));
	row.add(Ti.UI.createLabel({
		top : 35,
		text : route.getName()+ "\n",
		color : '#777',
		textAlign : 'left',
		width: Ti.UI.FILL,
		opacity :  0.6,
		left : 90,
		font : {
			fontSize : 10,
			fontFamily : "DroidSans"
		}
	}));
	row.add(Ti.UI.createImageView({
		left : 20,opacity :  0.7,
		image : "/images/" + route.getDescription().toLowerCase() + ".png",
		height : 40
	}));
	
	var switcher = Ti.UI.createSwitch({
		value : false, // mandatory property for iOS
		style :  Ti.UI.Android.SWITCH_STYLE_SWITCH,
		right : 10,
		bottom : 10
	});
	switcher.addEventListener("click",function(){
		Ti.UI.createNotification({message:"Noch nicht implementiert"}).show();
	});
 	row.add(switcher);
	return row;
};
