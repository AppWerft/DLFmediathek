'use strict';
var Favs = new (require('controls/favorites.adapter'))(),
    Model = require('model/stations'),
    Schema = require('controls/rss.adapter');

var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_args) {

	var activityworking = true;
	var self = Ti.UI.createView({
		backgroundColor : '#444',
		station : _args.station,
		date : _args.date ? _args.date : Moment().startOf('day'),
		itemId : {
			name : _args.station,
			mediathek : _args.mediathek,
		},
	});
	self.hideCurrent = function() {

	};
	// dummy
	self.bottomList = Ti.UI.createListView({
		top : 2,
		backgroundColor : _args.color,
		templates : {
			'mediathek' : require('TEMPLATES').mediathek,
		},
		defaultItemTemplate : 'mediathek',
		sections : [Ti.UI.createListSection()]
	});

	self.refreshView = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
		view : self.bottomList,
		top : 12,
		backgroundColor : '#444'
	});

	self.refreshView.addEventListener('refreshing', function() {
		setTimeout(function() {
			self.refreshView.setRefreshing(false);
		}, 2000);
		self.updateMediathekList();
	});
	self.add(self.refreshView);
	var dataItems = [];
	var lastPubDate = null;
	var currentMediathekHash = null;
	/* hiding of todays display */
	self.updateMediathekList = function() {
		self.refreshView.setRefreshing(true);
		setTimeout(function() {
			self.refreshView.setRefreshing(false);
		}, 3000);

		require('controls/mediathek.adapter')({
			url : _args.mediathek,
			station : _args.station,
			archiv : _args.archiv,
			nocache : (self.date.isSame(Moment().startOf('day'))) ? true : false,
			date : _args.date ? _args.date.format('DD.MM.YYYY') : Moment().format('DD.MM.YYYY'),
			onload : function(_sendungen) {
				if (_sendungen == null)
					return;
				self.refreshView.setRefreshing(false);
				if (currentMediathekHash == _sendungen.hash)
					return;
				currentMediathekHash = _sendungen.hash;
				self.bottomList.sections = [];
				_sendungen.mediathek.forEach(function(sendung) {
					var dataitems = [];
					sendung.subs.forEach(function(item) {
						item.title = sendung.name;
						var depub = {
							days : Moment.unix(item.killtime).diff(Moment(), 'days'),
							weeks : Moment.unix(item.killtime).diff(Moment(), 'weeks'),
							years : Moment.unix(item.killtime).diff(Moment(), 'years'),
						};
						switch (true) {
						case depub.days<15:
							depub.str = depub.days + ' Tagen';
							break;
						case (depub.days>=15 && depub.days<730):
							depub.str = depub.weeks + ' Wochen';
							break;
						default:
							depub.str = depub.years + ' Jahren';
						}
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
							cache : {
								image : item.cached ? 'images/cached.png' : '/images/cloud.png'
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
							depub : {
								text : 'Depublizierung in ' + depub.str,
								height : (item.killtime) ? Ti.UI.SIZE : 0
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
				self.bottomList.setMarker({
					sectionIndex : 5,
					itemIndex : 0
				});
			}
		});
	};
	var locked = false;
	self.bottomList.addEventListener('itemclick', _args.window.onitemclickFunc);
	Ti.App.addEventListener('app:state', function(_payload) {
		activityworking = _payload.state;
	});
	self.updateMediathekList();
	for (var i = 1; i < 10; i++)
		require("controls/nova/thema.adapter")(i, function(res) {
			console.log(res);
		});
	return self;
};
