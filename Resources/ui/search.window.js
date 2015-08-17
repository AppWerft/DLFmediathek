var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    Search = require('controls/search.adapter'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function() {
	function setDataintoSection(_res) {
		console.log(_res);
		var total = _res.items.length;
		self.container.setRefreshing(false);
		if (total > 0) {
			Ti.UI.createNotification({
				message : 'Suche nach ' + args.needle + ' ergab „' + total + '“ Treffer.'
			}).show();
			var items = [];
			_res.items.forEach(function(item) {
				items.push({
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
						text : 'Dauer: ' + item.duration
					},
					author : {
						text : 'Autor: ' + item.author
					}
				});
			});
			self.list.sections[_res.section].setItems(items);
		} else {
			АктйонБар.setSubtitle('Wurfsendung');
			Ti.UI.createNotification({
				duration : 5000,
				message : 'Suche ergab leider keine Treffer.\nAls kleiner, gutgemeinter Trost kommt jetzt eine Wurfsendung …'
			}).show();
			self.removeAllChildren();
			self.add(Ti.UI.createImageView({
				image : '/images/wurfsendung.png',
				bottom : 0,
				width : Ti.UI.FILL,
				height : 'auto'
			}));
			require('controls/wurfsendung.adapter')();
			self.children[0].addEventListener('click', require('controls/wurfsendung.adapter'));
		}
	};
	var args = arguments[0] || {};
	var color = 'silver';
	var self = Ti.UI.createWindow({
		fullscreen : true
	});
	self.addEventListener('focus', function() {
		self.list = Ti.UI.createListView({
			templates : {
				'search' : require('TEMPLATES').search,
			},
			defaultItemTemplate : 'search',
			backgroundColor : '#8CB5C0',
			sections : [Ti.UI.createListSection({
				headerTitle : 'Treffer in Mediathek'
			}), Ti.UI.createListSection({
				headerTitle : 'Treffer in Podcasts'
			})]
		});
		self.container = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
			view : self.list,
			height : Ti.UI.FILL,
			width : Ti.UI.FILL,
			backgroundColor : '#8CB5C0',
			refreshing : true
		});
		self.container.addEventListener('refreshing', function() {
			Ti.UI.createNotification({
				message : 'Hier ohne Sinn …'
			}).show();
			self.container.setRefreshing(false);
		});
		self.add(self.container);
		self.container.setRefreshing(true);
		Ti.UI.createNotification({
			duration : 3000,
			message : 'Lieber Gebührenzahler,\ndas dauert jetzt leider etwas länger. Es wird im Bestand der letzten fünf Jahre gesucht.'
		}).show();
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
		self.list.addEventListener('itemclick', function(_e) {
			var item = JSON.parse(_e.itemId);
			Ti.Media.vibrate([10, 200, 10, 200]);
			var PlayerOverlay = require('ui/hlsplayer.factory').createAndStartPlayer({
				color : item.color,
				url : item.url,
				duration : item.duration,
				title : item.title,
				subtitle : item.subtitle,
				station : item.stataion,
				pubdate : data.pubdate
			});
			self.add(PlayerOverlay);
			PlayerOverlay.oncomplete = function() {
				self.remove(PlayerOverlay);
				PlayerOverlay = null;
			};
		});

	});
	self.addEventListener('open', function(_event) {
		АктйонБар.setTitle('DRadio Suche');
		АктйонБар.setSubtitle('Suche nach „' + args.needle + '“');
		АктйонБар.setFont("Aller");
		АктйонБар.setBackgroundColor('#444444');
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				_menuevent.menu.clear();
				activity.actionBar.displayHomeAsUp = true;
			};
			activity.actionBar.onHomeIconItemSelected = function() {
				self.close();
			};
			activity && activity.invalidateOptionsMenu();
		}
	});
	return self;
};

