var Model = require('model/stations'),
    Feed = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');

String.prototype.toHHMMSS = function() {
	var sec_num = parseInt(this, 10);
	// don't forget the second param
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	var time = (hours != '00') ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds;
	return time;
};

module.exports = function(_args) {
	var self = Ti.UI.createWindow({
		fullscreen : true
	});
	self.list = Ti.UI.createListView({
		height : Ti.UI.FILL,
		backgroundColor : _args.station,
		templates : {
			'podcastlist' : require('TEMPLATES').podcastlist,
		},
		defaultItemTemplate : 'podcastlist',
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
						text : (item.duration) ? 'Dauer: ' + ('' + item.duration).toHHMMSS() : '',
						height : (item.duration) ? Ti.UI.SIZE : 0,
					},
					author : {
						text : (item.author) ? 'Autor: ' + item.author : 0,
						height : (item.author) ? Ti.UI.SIZE : 0,
					},
					cached : {
						opacity : item.cached ?1 :0
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
		require('ui/audioplayer.window').createAndStartPlayer({
			color : '#000',
			url : data.url,
			duration : data.duration,
			title : data.title,
			subtitle : Moment(data.pubdate).format('LLL') + ' Uhr',
			author : data.author,
			station : data.station,
			image : data.image,
			pubdate : data.pubdate
		});

	};
	self.addEventListener('open', function(_event) {
		АктйонБар.title = 'DeutschlandRadio';
		АктйонБар.subtitle = _args.title;
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');

		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
				if (_args.station)
					activity.actionBar.logo = '/images/' + _args.station + '.png';
				// _menuevent.menu.clear();
				_menuevent.menu.add({
					title : 'Kanal speichern',
					itemId : 0,
					icon : Ti.App.Android.R.drawable.ic_action_offline,
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function(_e) {
					var menuitem = _menuevent.menu.findItem('1');
					Feed.toggleFaved(_args.url);
					menuitem.setIcon(Feed.isFaved(_args.url) ? Ti.App.Android.R.drawable.ic_action_faved : Ti.App.Android.R.drawable.ic_action_favorite_add);
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
