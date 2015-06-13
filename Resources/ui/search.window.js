var Model = require('model/stations'),
    Moment = require('vendor/moment'),
    SearchInMediathek = require('controls/search.adapter'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function() {
	var args = arguments[0] || {};
	var color = 'silver';
	var self = Ti.UI.createWindow({
		fullscreen : true
	});
	var Player = require('ui/hlsplayer.widget').createPlayer();
	self.addEventListener('focus', function() {
		self.list = Ti.UI.createListView({
			templates : {
				'search' : require('TEMPLATES').search,
			},
			defaultItemTemplate : 'search',
			backgroundColor : '#8CB5C0',
			sections : [Ti.UI.createListSection({})]
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
		SearchInMediathek({
			needle : args.needle,
			done : function(_items) {
				var total = _items.length;
				self.container.setRefreshing(false);
				if (total > 0) {
					Ti.UI.createNotification({
						message : 'Suche nach ' + args.needle + ' ergab „' + total + '“ Treffer.'
					}).show();
					var items = [];
					_items.forEach(function(item) {
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
					self.list.sections[0].setItems(items);
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
					self.children[0].addEventListener('singletap', function() {
						self.container.setRefreshing(false);
						var ndx = require('controls/wurfsendung.adapter')({
							done : function() {
								self.container.setRefreshing(false);
							}
						});
						АктйонБар.setSubtitle('Wurfsendung №' + ndx);
					});
					//                    self.close();
				}
			}
		});
		self.list.addEventListener('itemclick', function(_e) {
			var item = JSON.parse(_e.itemId);
			self.PlayerView = Player.createView({
				color : item.color,
			});
			self.add(self.PlayerView);
			Player.startPlayer({
				url : item.url,
				title : item.sendung,
				subtitle : item.title,
				station : item.stataion,
				duration : item.duration
			});
		});

	});
	self.addEventListener('open', function(_event) {
		АктйонБар.setTitle('DLR Mediathek');
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

