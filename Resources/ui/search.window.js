var Stations = require('model/stations'),
    Moment = require('vendor/moment'),
    Search = require('controls/search.adapter'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function() {
	function item2dataitem(item) {
		return {
			properties : {
				itemId : JSON.stringify(item),
			},
			image : {
				image : item.image
			},
			title : {
				text : item.title
			},
			sendung : {
				text : item.sendung,
				color : item.color
			},
			pubdate : {
				text : 'Sendedatum: ' + item.pubdate + ' Uhr'
			},
			duration : {
				text : 'Dauer: ' + Moment.unix(item.duration).format("mm:ss")
			},
			author : {
				text : 'Autor: ' + item.author
			}
		};
	}

	function setDataintoSection(_res) {
		var total = _res.items.length;
		if (total > 0) {
			Ti.UI.createNotification({
				message : 'Suche nach ' + args.needle + ' ergab „' + total + '“ Treffer.'
			}).show();
			var items = [];
			_res.items.forEach(function(item, i) {
				if (i < 100)
					items.push(item2dataitem(item));
			});
			if (_res.where == 'mediathek') {
				$.waterProgressView.hide();
			} else {
				_res.items.forEach(function(item, i) {
					console.log(item);
				});
			}
			$.listView.sections[_res.where == 'mediathek' ? 0 : 1].setItems(items);

		}
	};
	/* START of implementation*/
	var args = arguments[0] || {};
	var color = 'silver';
	var $ = Ti.UI.createWindow();
	$.addEventListener('open', function(_event) {
		АктйонБар.setTitle('DRadio Suche');
		АктйонБар.setSubtitle('Suche nach „' + args.needle + '“');
		АктйонБар.setFont("Aller");
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor('#444444');
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				_menuevent.menu.clear();
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				$.close();
			};
			activity && activity.invalidateOptionsMenu();
		}
		$.listView = Ti.UI.createListView({
			templates : {
				'search' : require('TEMPLATES').search,
			},
			top : 80,
			defaultItemTemplate : 'search',
			backgroundColor : '#8CB5C0',
			sections : [Ti.UI.createListSection({
				headerTitle : 'Treffer in Mediathek'
			}), Ti.UI.createListSection({
				headerTitle : 'Treffer in Podcasts'
			})]
		});

		Search({
			where : 'mediathek',
			section : 0,
			needle : args.needle,
			done : setDataintoSection
		});
		Search({
			where : 'podcast',
			section : 1,
			needle : args.needle,
			done : setDataintoSection
		});
		$.listView.addEventListener('itemclick', function(_e) {
			var data = JSON.parse(_e.itemId);
			require('ui/audioplayer.window').createAndStartPlayer({
				color : '#000',
				url : data.url,
				duration : data.duration,
				title : data.sendung || '',
				subtitle : data.title || '',
				author : data.author,
				station : data.station,
				pubdate : data.pubdate
			});
		});
		var progress = 1;
		$.waterProgressView = require('ti.waterwaveprogress').createView({
			width : 200,
			height : 200,
			showWater : true,
			waterColor : Stations['dlf'].color,
			waterBgColor : Stations['drk'].color,
			showRing : true,
			ringWidth : 30,
			ring2WaterWidth : 10,
			ringColor : Stations['dlf'].color,
			ringBgColor : Stations['drk'].color,
			showNumerical : true,
			fontSize : 162,
			textColor : Stations['drw'].color,
			α : 0.6

		});
		var setProgressFn = function() {
			if (progress <= 100 && $.waterProgressView) {
				$.waterProgressView.setProgress(progress);
				progress++;
				setTimeout(setProgressFn, 40);
			}
		};
		setProgressFn();
		$.add($.listView);
		$.add($.waterProgressView);
	});

	return $;
};
