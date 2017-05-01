var АктйонБар = require('com.alcoapps.actionbarextras');
var Moment = require("vendor/moment");

module.exports = function(_thema) {

	var activityworking = false;
	var $ = Ti.UI.createWindow({
		fullscreen : false,
		layout : "vertical",
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var netBrowser = require("ti.airlino").createBrowser({
		lifecycleContainer : $,
	});
	$.add(Ti.UI.createLabel({
		top : 90,
		color : "#333",
		left : 10,
		right : 10,
		font : {
			fontSize : 22,
			fontFamily : "Aller"
		},
		text : "Hier kann die App WLAN-Hifi-Empfänger wie Raumfeld™, SONOS™, Chromecast™ oder Airlino™ ansteuern."
	}));
	$.addEventListener('close',function() {
		$.mainlist.data= [];	
	});
	$.addEventListener('open', function(_event) {
		АктйонБар.title = "Deutschlandfunk";
		АктйонБар.subtitle = "Konfiguration Hifi-Empfänger";
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.setBackgroundColor("#444	");
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setStatusbarColor("black");
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function() {
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				$.close();
			};
			activity.invalidateOptionsMenu();
		}
	});

	var activityworking = false;

	$.hideCurrent = function() {

	};
	var sections = [];
	$.mainlist = Ti.UI.createTableView({
		top : 0
	});

	$.refreshView = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
		view : $.mainlist,
		top : 5,

	});

	function onSuccessFn(e) {
		devices = e.devices;
		$.mainlist.data = [];
		devices.forEach(function(device) {
			var row = Ti.UI.createTableViewRow({

			});
			row.add(Ti.UI.createLabel({
				top : 10,
				text : device.name,
				color : '#333',
				textAlign : 'left',
				left : 150,
				font : {
					fontSize : 24,
					fontFamily : "Aller bold"
				}
			}));
			row.add(Ti.UI.createImageView({
				top : 10,
				left : 5,
				image : "/images/" + device.name.toLowerCase() + ".png",
				height : 60
			}));
			row.add(Ti.UI.createLabel({
				top : 60,
				text : device.host + ":" + device.port + "\n",
				color : '#333',
				textAlign : 'left',
				left : 150,
				font : {
					fontSize : 16,
					fontFamily : "Aller"
				}
			}));
			row.add(Ti.UI.createSwitch({
				value : true, // mandatory property for iOS
				style : Ti.UI.Android.SWITCH_STYLE_CHECKBOX,
				width : 120,
				height : 120,
				right : 10,
				bottom : 10
			}));
			$.mainlist.appendRow(row);
		});
	}


	$.refreshView.addEventListener('refreshing', function() {
		setTimeout(function() {
			$.refreshView.setRefreshing(false);
		}, 3 * 1000);
		return;
		netBrowser.startScan({
			onSuccess : onSuccessFn,
			onError : function() {
				console.log("not found");
			}
		});

	});
	$.add($.refreshView);
	netBrowser.startScan({
		onSuccess : onSuccessFn,
		onError : function() {
			console.log("not found");
		}
	});
	$.open();
};
