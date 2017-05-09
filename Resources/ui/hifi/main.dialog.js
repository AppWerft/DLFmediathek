var BTA2DP = require("de.appwerft.a2dp");

var AIRLINO = 0,
    GOOGLE = 1,
    BT = 2;
var HBM10 = require("ti.airlino");

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
			if (device.nearby == true) {
				if (e.row.switcher.getValue() == true) {
					BTA2DP.disconnectFrom(device.name);
				} else {
					e.row.spinner.show();
					setTimeout(function() {
						e.row.spinner.hide();
					}, 5000);
					BTA2DP.connectWith(device.name);
				}
			} else
				Ti.UI.createNotification({
					duration : 8000,
					message : "„" + device.name + "“ ist nicht in Reichweite oder ausgeschaltet.\n\nEs gibt aber auch die Möglichkeit, daß es nicht bereit für eine Verbindung ist.\n\nDann sollte jetzt der Knopf am Gerät gedrückt werden."
				}).show();
			break;
		default:
			Ti.UI.createNotification({
				message : "Noch nicht unterstützt."
			}).show();
		}
	});
	var $ = Ti.UI.createAlertDialog({
		title : "Wiedergabe auf externen Lautsprechern",
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

	var MSearch = HBM10.createMSearch();
	//MSearch.start();

	var AirlinoBrowser = HBM10.createZeroConfBrowser({
		dnstype : "dockset",
		onchange : function(e) {
			clearTimeout(cron);
			updateSection(AIRLINO, e.devices, "ui/hifi/row" + AIRLINO);
		}
	});
	//var GooglecastBrowser = require("ti.googlecast").createMediaRouter({}).start();

	var btAvail = BTA2DP.Bluetooth.getAvailibility();
	switch (btAvail) {
	case 0:
		alert("Dieses Gerät unterstützt überhaupt kein Bluetooth – deswegen kann es auch nicht eingeschaltet werden.");
		break;
	case 1:
		BTA2DP.Bluetooth.enableBluetooth({
			onsuccess : function() {
				handleBluetooth();
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
				BTA2DP.DiscoveryNearbyDevices.start();
			}
		});

	}


	AirlinoBrowser.start();

	$.addEventListener("click", function() {
		AirlinoBrowser.stop();
		//GooglecastBrowser.stop();
		BTA2DP && BTA2DP.DiscoveryNearbyDevices.stop();
		BTA2DP && BTA2DP.stopMonitorPairedDevices();

	});
	$.show();
};
// http://stackoverflow.com/questions/tagged/sonos