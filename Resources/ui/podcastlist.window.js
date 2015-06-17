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
		fullscreen : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var Player = require('ui/hlsplayer.widget').createPlayer();
	self.AudioPlayerView = Player.createView({
		color : _args.color
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
				var image = (res) ? res[1] : item.channelimage;
				var height = (res) ? 65 : 90;
				var description = (res) ? res[3] : null;
				var copyright = (res) ? res[2] : null;
				items.push({
					pubdate : {
						text : Moment(item.pubdate).format('LLL') + ' Uhr'
					},
					image : {
						image : image,
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
						text : (item.duration) ? 'Dauer: ' + (''+item.duration).toHHMMSS() : '',
						height : (item.duration) ? Ti.UI.SIZE : 0,

					},
					author : {
						text : (item.author) ? 'Autor: ' + item.author : 0,
						height : (item.author) ? Ti.UI.SIZE : 0,

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
					duration:3000,
					message : item.copyright.text.replace(/&quot;/g,'"')
				}).show();
		} else {
			var item = JSON.parse(_e.itemId);
			self.add(self.AudioPlayerView);
			if (item.duration && item.pubdate) {
				Player.startPlayer({
					url : item.url,
					title : item.title,
					station : item.station,
					pubdate : item.pubdate,
					duration : item.duration,
					sendung : item.podcast
				});
			}
		}
	});
	self.addEventListener('close', function() {
		Player.stopPlayer();
	});
	self.addEventListener('open', function(_event) {
		АктйонБар.title = 'DeutschlandRadio';
		АктйонБар.subtitle = _args.title;
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');

		var activity = _event.source.getActivity();
		if (activity) {
			console.log('activity');
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
				if (_args.station)
					activity.actionBar.logo = '/images/' + _args.station + '.png';
				// _menuevent.menu.clear();
				_menuevent.menu.add({
					title : 'Kanal merken',
					itemId : '1',
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
