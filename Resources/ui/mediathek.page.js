var Favs = new (require('controls/favorites.adapter'))(),
    Model = require('model/stations');
CurrentTransmission = new (require('controls/rss.adapter'))();
var Moment = require('vendor/moment');
Moment.locale('de');

const HEIGHT_OF_TOPBOX = 160;

module.exports = function(_args) {
	var activityworking = true;
	var self = Ti.UI.createView({
		backgroundColor : '#444',
		station : _args.station,
		date : Moment().startOf('day'),
		itemId : {
			name : _args.station,
			mediathek : _args.mediathek,
			//	live : _args.live,
			//	stream : _args.stream
		},
	});

	Ti.App.addEventListener('daychanged', function() {
		self.date = Moment().startOf('day');
	});
	setTimeout(function() {
		self.calendarView = require('ui/calendar.widget')({
			self : self,
			color : _args.color
		});
		self.add(self.calendarView);
	}, 3000);

	var TopBoxWidget = new (require('ui/currenttop.widget'))();
	self.topBox = TopBoxWidget.createView({
		height : HEIGHT_OF_TOPBOX,
		color : _args.color
	});

	self.add(self.topBox);
	self.add(Ti.UI.createView({
		top : 0,
		height : 7,
		backgroundColor : _args.color
	}));
	self.bottomList = Ti.UI.createListView({
		top : 7,
		height : Ti.UI.FILL,
		backgroundColor : _args.color,
		templates : {
			'mediathek' : require('TEMPLATES').mediathek,
		},
		defaultItemTemplate : 'mediathek',
		sections : [Ti.UI.createListSection({})]
	});
	self.bottomView = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
		view : self.bottomList,
		height : Ti.UI.FILL,
		width : Ti.UI.FILL,
		backgroundColor : '#444'
	});
	self.bottomView.addEventListener('refreshing', function() {
		if (Math.random() > 0.97)
			Ti.UI.createNotification({
				message : 'Sehr gut, Medienkompetenz=1!\nAber bitte nicht allzuoft hier ziehen. Empfehlung: so alle fünf Minuten – sonst leierst aus …'
			}).show();
		setTimeout(function() {
			self.bottomView.setRefreshing(false);
		}, 5000);
		self.updateMediathekList();
	});
	self.add(self.bottomView);
	var dataItems = [];
	var lastPubDate = null;
	var currentMediathekHash = null;
	self.updateCurrentinTopBox = function(_forced) {
		if (_args.station == 'drw') {
			TopBoxWidget.addBanner();
			// ratio = 40/11
			self.topBox.setTop(8);
			self.bottomView.setTop(HEIGHT_OF_TOPBOX * .66);
		} else {
			var currentItem = CurrentTransmission.getCurrentOnAir({
				station : _args.station
			});
			if (currentItem) {
				lastPubDate = currentItem.pubDate;
				self.topBox.setTop(8);
				self.bottomView.setTop(HEIGHT_OF_TOPBOX);
				TopBoxWidget.setProgress(currentItem.progress);
				TopBoxWidget.setPubDate(currentItem.pubDate);
				TopBoxWidget.setTitle(currentItem.title);
				TopBoxWidget.setDescription(currentItem.description);
				self.bottomView.animate({
					top : HEIGHT_OF_TOPBOX,
					duration : 700
				});
			}
		}
	};
	/* hiding of todays display */
	self.hideCurrent = function() {
		self.bottomView.setTop(7);
		self.topBox.setTop(-HEIGHT_OF_TOPBOX);
	};
	self.updateMediathekList = function() {
		self.bottomView.setRefreshing(true);
		setTimeout(function() {
			self.bottomView.setRefreshing(false);
		}, 10000);
		if (activityworking == false) {
			return;
		}
		require('controls/rpc.adapter')({
			url : _args.mediathek,
			station : _args.station,
			nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
			date : self.date.format('DD.MM.YYYY'),
			onload : function(_sendungen) {
				if (_sendungen == null)
					return;
				self.bottomView.setRefreshing(false);
				if (currentMediathekHash == _sendungen.hash)
					return;
				currentMediathekHash = _sendungen.hash;
				self.bottomList.sections = [];
				_sendungen.mediathek.forEach(function(sendung) {
					var dataitems = [];
					sendung.subs.forEach(function(item) {
						item.title = sendung.name;
						dataitems.push({
							properties : {
								accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
								itemId : JSON.stringify(item),
							},
							start : {
								text : item.start
							},
							playtrigger : {
								bubbleParent : false
							},
							title : {
								color : _args.color,
								text : '',
								height : 0
							},
							subtitle : {
								text : item.subtitle,
							},
							fav : {
								image : item.isfav ? '/images/fav.png' : '/images/favadd.png',
								opacity : item.isfav ? 0.8 : 0.5
							},
							share : {
								opacity : 0.7
							},
							autor : {
								text : (item.author) ? 'Autor: ' + item.author : '',
								height : (item.author) ? Ti.UI.SIZE : 0
							},
							duration : {
								text : (item.duration) ? 'Dauer: ' + Moment().startOf('day').seconds(item.duration).format('m:ss') : '',
							}
						});
					});
					self.bottomList.appendSection(Ti.UI.createListSection({
						headerTitle : sendung.name,
						items : dataitems
					}));
				});
				if (self.date.isSame(Moment().startOf('day')) && _args.station != 'drw	')
					self.updateCurrentinTopBox();
				self.bottomList.setMarker({
					sectionIndex : 5,
					itemIndex : 0
				});
				self.bottomList.addEventListener('marker', function(e) {
					self.topBox.animate({
						top : -HEIGHT_OF_TOPBOX,
					});
					self.bottomView.animate({
						top : 8,
						duration : 600
					});
					return;
					self.bottomList.setMarker({
						sectionIndex : 0,
						itemIndex : 0
					});
				});
			}
		});
	};

	if (self.date.isSame(Moment().startOf('day')))
		self.cron = setInterval(self.updateMediathekList, 300000);
	else
		clearInterval(self.cron);
	var locked = false;
	var onitemclickFunc = function(_e) {
		var start = new Date().getTime();
		if (locked == true)
			return;
		locked = true;
		setTimeout(function() {
			locked = false;
		}, 700);
		if (_e.bindId && _e.bindId == 'fav') {
			var item = _e.section.getItemAt(_e.itemIndex);
			var isfav = Favs.toggleFav(JSON.parse(item.properties.itemId));
			item.fav.image = isfav ? '/images/fav.png' : '/images/favadd.png';
			item.fav.opacity = isfav ? 0.8 : 0.5;
			_e.section.updateItemAt(_e.itemIndex, item);
		} else if (_e.bindId && _e.bindId == 'share') {
			Ti.Media.vibrate(1, 0);
			require('ui/sharing.chooser')(function(_type) {
				require('vendor/socialshare')({
					type : _type,
					message : 'Höre gerade mit der #DRadioMediathekApp „' + JSON.parse(_e.itemId).subtitle + '“ auf ' + Model[_args.station].name,
					url : JSON.parse(_e.itemId).url,
					// image : fileToShare.nativePath,
				});
			});
		} else if (_e.bindId && _e.bindId == 'playtrigger') {
			var data = JSON.parse(_e.itemId);
			Ti.Media.vibrate([2, 100]);
			var PlayerOverlay = require('ui/hlsplayer.factory').createAndStartPlayer({
				color : _args.color,
				url : data.url,
				duration : data.duration,
				title : data.title,
				subtitle : data.subtitle,
				author : data.author,
				station : data.station,
				pubdate : data.pubdate
			});
			self.add(PlayerOverlay);
			PlayerOverlay.oncomplete = function() {
				try {
					self.remove(PlayerOverlay);
					PlayerOverlay = null;
				} catch(E) {
					console.log(E);
				}
			};
			console.log('Info: constructTime for player: ' + (new Date().getTime() - start));
		}
	};
	self.bottomList.addEventListener('itemclick', onitemclickFunc);
	if (_args.station != 'drw')
		setInterval(self.updateCurrentinTopBox, 5000);
	Ti.App.addEventListener('app:state', function(_payload) {
		activityworking = _payload.state;
	});
	self.updateMediathekList();
	return self;
};
