var Model = require('model/stations'),
    Feed = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment'),
    АктйонБар = require('com.alcoapps.actionbarextras');
var FAVED = Ti.App.Android.R.drawable.ic_action_faved;
var NOFAVED = Ti.App.Android.R.drawable.ic_action_favorite_add;
module.exports = function(_args) {
	var $ = Ti.UI.createWindow({
		layout : "vertical",
		backgroundColor : _args.color || "white"
	});
	function updateUI() {
		if (_args.banner) {
			$.add(Ti.UI.createImageView({
				image : "/images/podcasts/banner/" + _args.banner,
				top : 85,
				left : 5,
				right : 5,
				bottom : 5,
				width : Ti.UI.FILL,
				height : "auto",
				font : {
					fontFamily : "Aller",
					fontSize : 22
				}
			}));
		}
		if (_args.text) {
			$.add(Ti.UI.createLabel({
				text : _args.text,
				top : 85,
				textAlign : "left",
				width : Ti.UI.FILL,
				left : 5,
				color : "white",

				right : 5,
				font : {
					fontFamily : "Aller",
					fontSize : 16
				}
			}));
		}
		$.list = Ti.UI.createListView({
			height : Ti.UI.FILL,
			backgroundColor : _args.station,
			templates : {
				'podcastlist' : require('TEMPLATES').podcastlist,
			},
			defaultItemTemplate : 'podcastlist',
			top : (_args.banner || _args.text) ? 0 : 84,
			sections : [Ti.UI.createListSection({})]
		});
		function scrollStartFn() {
			$.list.removeEventListener("scrollstart", scrollStartFn);
			if (_args.banner || _args.text)
				$.children[0].animate({
					height : 0
				});
		}


		$.list.addEventListener("scrollstart", scrollStartFn);
		Feed.getFeed({
			url : _args.url,
			done : function(_feeditems) {
				var items = [];
				_feeditems.items && _feeditems.items.forEach(function(item) {
					var res = /<img src="(.*?)"\s.*?title="(.*?)".*?\/>(.*?)</gmi.exec(item.description);
					item.image = (res) ? res[1] : item.channelimage;
					var height = (res) ? 65 : 90;
					var description = (res) ? res[3] : null;
					var copyright = (res) ? res[2] : null;
					var pubdate = Moment(item.pubDate).format('LLL') + ' Uhr';
					item.station = _args.station ? _args.station : 'dlf';
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
							text : clean(item.title),
							color : _args.color
						},
						description : {
							text : clean(description),
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
				if ($ && $.list && $.list.sections[0])
					$.list.sections[0].setItems(items);
			}
		});
		$.add($.list);
		function onItemcClickFn(_e) {
			if (_e.bindId && _e.bindId == 'image') {
				var item = _e.section.getItemAt(_e.itemIndex);
				if (item.copyright.text != null)
					Ti.UI.createNotification({
						duration : 3000,
						message : item.copyright.text.replace(/&quot;/g, '"')
					}).show();
			} else {
				var item = JSON.parse(_e.itemId);
				$.createAndStartPlayer(item);
			}
		}


		$.list.addEventListener('itemclick', onItemcClickFn);
		$.createAndStartPlayer = function(data) {
			if (!data.url)// new since 02/2006 (new feed structur)
				data.url = data.enclosure.url;
			require('ui/audioplayer.window').createAndStartPlayer({
				color : Model[data.station].color,
				url : data.url,
				duration : data.duration,
				title : _args.title,
				subtitle : data.title,
				author : data.author,
				station : data.station,
				image : data.image,
				pubdate : data.pubdate
			});

		};

	}


	$.addEventListener('close', function(_event) {
		$.removeAllChildren();
		$ = null;
	});
	$.addEventListener('open', function(_event) {
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
				_menuevent.menu.add({
					title : 'Kanal speichern',
					itemId : 0,
					visible:false,
					icon : Ti.App.Android.R.drawable.ic_action_cache,
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function(_e) {
					Feed.cacheAll(_args.url, _args.station);
				});
				_menuevent.menu.add({
					title : 'Kanal merken',
					itemId : 1,
					icon : (Feed.isFaved(_args.url)) ? FAVED : NOFAVED,
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				}).addEventListener("click", function(_e) {
					var menuitem = _menuevent.menu.findItem('1');
					var message;
					if (Feed.isFaved(_args.url)) {
						message = "Dieser Podcast ist nun entfreunded";
					} else {
						message = "Dieser Podcast ist vorgemerkt und auf der liste der Lieblingspodcasts erreichbar";
					}
					Feed.toggleFaved(_args.url);
					Ti.UI.createNotification({
						message : message
					}).show();
					menuitem.setIcon(Feed.isFaved(_args.url) ? FAVED : NOFAVED);
				});
				activity.actionBar.onHomeIconItemSelected = function() {
					$.close();
				};
			};
			activity.invalidateOptionsMenu();
		}
		updateUI();
	});
	return $;
};
