var BTA2DP = require("de.appwerft.a2dp");

var AIRLINO = 0,
    GOOGLE = 1,
    BT = 2;

module.exports = function(_dark) {
	var dark = (_dark == undefined) ? false : true;
	function updateSection(ndx, data, module) {
		var section = androidView.getSections()[ndx];
		section.ndx = ndx;
		var rows = section.getRows();
		rows && rows.forEach(function(row) {
			section.remove(row);
		});
		data.forEach(function(device) {
			var row = require(module)(device, dark);
			section.add(row);
		});
		androidView.sections[ndx] = section;
		androidView.setData(androidView.getData());
	}

	var androidView = Ti.UI.createTableView({
		backgroundColor : (dark) ? "#444" : "#fff",
		sections : [Ti.UI.createTableViewSection(), Ti.UI.createTableViewSection(), Ti.UI.createTableViewSection()],
		height : 180
	});
	androidView.addEventListener("click", function(e) {
		var device = JSON.parse(e.row.itemId);
		console.log(e.row.itemId);
		Ti.Media.vibrate([5, 5]);
		switch (e.section.ndx) {
		case BT:
			if (e.row.switcher.getValue() == true) {

				BTA2DP.disconnectFrom(device.name);
			} else {
				e.row.spinner.show();
				setTimeout(function() {
					e.row.spinner.hide();
				}, 5000);
				BTA2DP.connectWith(device.name);
			}
			break;
		default:
			Ti.UI.createNotification({
				message : "Noch nicht unterstützt."
			}).show();
		}
	});
	var $ = Ti.UI.createAlertDialog({
		message : "Hier kann die App mit Wifi-Boxen von Teufel™, Harman™ oder Heos™, mit Empfängern wie Chromecast™ oder Airlino™ oder mit Bluetoothgeräten verbunden werden.\n",
		cancel : 0,
		//title : "Kopplung mit externen Lautsprechern/Empfängern",
		persistent : true,
		buttonNames : ['Erledigt'],
		androidView : androidView
	});

	var cron = setTimeout(function() {
		Ti.UI.createNotification({
			message : "Leider kein HiFi-Empfänger gefunden.",
			duration : 5000
		}).show();
	}, 3000);
	var AirlinoBrowser = require("ti.airlino").createDiscoveryResolver({
		dnstype : "dockset",
		onchange : function(e) {
			clearTimeout(cron);
			updateSection(AIRLINO, e.devices, "ui/hifi/row" + AIRLINO);
		}
	});
	var ChromecastBrowser = require("ti.airlino").createDiscoveryResolver({
		dnstype : "googlecast",
		onchange : function(e) {
			clearTimeout(cron);
			updateSection(GOOGLE, e.devices, "ui/hifi/row" + GOOGLE);
		}
	});
	var btAvail = BTA2DP.Bluetooth.getAvailibility();
	switch (btAvail) {
	case 0:
		alert("Dieses Gerät unterstützt überhaupt kein Bluetooth – deswegen kann es auch nicht eingeschaltet werden.");
		break;
	case 1:
		BTA2DP.Bluetooth.enableBluetooth({
			onsuccess : function() {
				alert("OK");
			},
			onerror : function() {
			}
		});
		break;
	case 2:
		handleBluetooth();
		break;
	default:
		console.log("default state");
	}
	function handleBluetooth() {
		require("vendor/permissions").requestPermissions(["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"], function(suc) {
			if (suc == true) {
				BTA2DP.startMonitorPairedDevices({
					type : BTA2DP.DEVICE_TYPE_CLASSIC,
					onchanged : function(e) {
						updateSection(BT, e.devices, "ui/hifi/row" + BT);
					}
				});
				BTA2DP.DiscoveryNearbyDevices.start({

				});
			}
		});

	}


	AirlinoBrowser.start();
	ChromecastBrowser.start();
	$.addEventListener("click", function() {
		AirlinoBrowser.stop();
		ChromecastBrowser.stop();
		BTA2DP && BTA2DP.DiscoveryNearbyDevices.stop();
		BTA2DP && BTA2DP.stopMonitorPairedDevices();
		

	});
	$.show();
};
// http://stackoverflow.com/questions/tagged/sonos