var Model = require('model/stations'),
    Feed = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
	var self = Ti.UI.createWindow({

	});
	self.list = Ti.UI.createListView({
		height : Ti.UI.FILL,
		backgroundColor : _args.station,
		templates : {
			'podcastlist' : require('TEMPLATES').podcastlist,
		},
		defaultItemTemplate : 'podcastlist',
		top : 78,
		sections : [Ti.UI.createListSection({})]
	});
	var items = [];
	Feed.getFeed({
		url : _args.url,
		done : function(_feeditems) {
			_feeditems.items.forEach(function(item) {
				var res = /<img src="(.*?)"\s.*?title="(.*?)".*?\/>(.*?)</gmi.exec(item.description);
				item.image = (res) ? res[1] : item.channelimage;
				var height = (res) ? 65 : 90;
				var description = (res) ? res[3] : null;
				var copyright = (res) ? res[2] : null;
				var pubdate = Moment(item.pubdate).format('LLL') + ' Uhr';
				if (!item.station)
					item.station = 'dlf';
				items.push({
					pubdate : {
						text : pubdate
					},
					image : {
						image : item.image ? item.image : undefined,
						height : height,
						defaultImage : '/images/' + _args.station + '.png'
					},
					copyright : {
						text : copyright
					},
					title : {
						text : item.title,
						color : _args.color
					},
					description : {
						text : description,
						color : 'gray',
						height : (description) ? Ti.UI.SIZE : 0
					},
					duration : {
						text : (item.duration) ? 'Dauer: ' + ('' + item.duration * 1000).toHHMMSS() : '',
						height : (item.duration) ? Ti.UI.SIZE : 0,
					},
					author : {
						text : (item.author) ? 'Autor: ' + item.author : 0,
						height : (item.author) ? Ti.UI.SIZE : 0,
					},
					cached : {
						opacity : item.cached ? 1 : 0
					},
					properties : {
						itemId : JSON.stringify(item)
					}
				});
			});
			self.list.sections[0].setItems(items);
		}
	});
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		if (_e.bindId && _e.bindId == 'image') {
			var item = _e.section.getItemAt(_e.itemIndex);
			if (item.copyright.text != null)
				Ti.UI.createNotification({
					duration : 3000,
					message : item.copyright.text.replace(/&quot;/g, '"')
				}).show();
		} else {
			var item = JSON.parse(_e.itemId);
			self.createAndStartPlayer(item);
		}
	});
	self.createAndStartPlayer = function(data) {
		if (!data.url)// new since 02/2006 (new feed structur)
			data.url = data.enclosure.url;
		require('ui/audioplayer.window').createAndStartPlayer({
			color : Model[data.station].color,
			url : data.url,
			duration : data.duration,
			title : Moment(data.pubdate).format('LLL') + ' Uhr',
			subtitle : data.title,
			author : data.author,
			station : data.station,
			image : data.image,
			pubdate : data.pubdate
		});

	};
	self.addEventListener('open', function(_event) {
		var station = Ti.App.Properties.getString('LAST_STATION', 'dlf');
		АктйонБар.title = Model[station].name;
		АктйонБар.subtitle = _args.title;
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor(Model[station].color);
		var activity = _event.source.getActivity();
		if (activity) {
			activity.actionBar.logo = '/images/' + station + '.png';
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
				if (_args.station)
					activity.actionBar.logo = '/images/' + _args.station + '.png';
				// _menuevent.menu.clear();
				_menuevent.menu.add({
					title : 'Kanal speichern',
					itemId : 0,
					icon : Ti.App.Android.R.drawable.ic_action_cache,
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function(_e) {
					Feed.cacheAll(_args.url);
				});
				_menuevent.menu.add({
					title : 'Kanal merken',
					itemId : 1,
					icon : (Feed.isFaved(_args.url)) ? Ti.App.Android.R.drawable.ic_action_faved : Ti.App.Android.R.drawable.ic_action_favorite_add,
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function(_e) {
					var menuitem = _menuevent.menu.findItem('1');
					Feed.toggleFaved(_args.url);
					menuitem.setIcon(Feed.isFaved(_args.url) ? Ti.App.Android.R.drawable.ic_action_faved : Ti.App.Android.R.drawable.ic_action_favorite_add);
				});
				activity.actionBar.onHomeIconItemSelected = function() {
					self.close();
				};
			};
			activity.invalidateOptionsMenu();
		}
	});

	return self;
};
