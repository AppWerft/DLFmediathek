var Model = require('model/stations'),
    Feed = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_args) {
	var self = Ti.UI.createWindow({
		fullscreen : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var Player = require('ui/audioplayer.widget').createPlayer();
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
				var res = /<img src="(.*?)"\s.*?\/>(.*?)</gmi.exec(item.description);
				var image = (res) ? res[1] : item.channelimage;
				var height = (res) ? 65 : 90;
				var description = (res) ? res[2] : null;
				if (res) console.log(res);
				items.push({
					pubdate : {
						text : Moment(item.pubDate).format('LLL')
					},
					image : {
						image : image,
						height : height,
						defaultImage : '/images/' + _args.station + '.png'
					},
					title : {
						text : item.title,
						color : _args.color
					},
					description : {
						text : description,
						color : 'gray',
						height : (description) ? Ti.UI.SIZE:0
					},
					duration : {
						text : (item.duration) ? 'Dauer: ' + item.duration : '',
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
	self.add(self.AudioPlayerView);
	self.list.addEventListener('itemclick', function(_e) {
		var item = JSON.parse(_e.itemId);
		console.log(item);
		if (!item.duration)
			item.duration = item['itunes:duration'];
		if (!item.enclosure_url)
			item.enclosure_url = item.enclosure.url;

		if (item.duration) {
			var sec = parseInt(item.duration.split(':')[0]) * 60 + parseInt(item.duration.split(':')[1]);
			Player.startPlayer({
				url : item.enclosure_url,
				title : item.title,
				sec : sec,
				duration : item.duration
			});
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
