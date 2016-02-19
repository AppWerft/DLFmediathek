var Model = require('model/stations'),
    Recents = new (require('controls/recents.adapter'))(),
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

/*   ===================  */
module.exports = function() {
	var self = Ti.UI.createWindow({
		fullscreen : false,
	});
	
	require('de.manumaticx.crouton').info("Langes Pressen löscht Beitrag.");
	self.list = Ti.UI.createListView({
		top : 80,
		height : Ti.UI.FILL,
		templates : {
			'recents' : require('TEMPLATES').recents,
		},
		defaultItemTemplate : 'recents',
		sections : [Ti.UI.createListSection({})]
	});
	var items = [];
	self.updateList = function() {
		var recents = Recents.getAllRecents();
		var items = recents.map(function(item) {
			return {
				title : {
					text : item.subtitle,
				},
				image : {
					image : item.image,
				},
				cached : {
					opacity : (require('controls/cache.adapter').isCached(item) ? 1 : 0)
				},
				sendung : {
					text : item.title,
					height : (item.title) ? Ti.UI.SIZE : 0,
					color : (item.title && item.station) ? Model[item.station].color : '#555'
				},
				author : {
					text : 'Autor: ' + item.author,
					height : (item.author) ? Ti.UI.SIZE : 0,
				},
				progress : {
					text : 'schon gehört: ' + Math.floor(item.progress * 100) + '%',
				},
				duration : {
					text : (item.duration) ? 'Dauer: ' + ('' + item.duration).toHHMMSS() : '',
					height : (item.duration) ? Ti.UI.SIZE : 0,
				},
				pubdate : {
					text : (item.pubdate) ? 'Sendezeit : ' + require('vendor/smartDate')(item.pubdate) : ''
				},
				lastaccess : {
					text : (item.lastaccess) ? 'Hörzeit : ' + require('vendor/smartDate')(item.lastacccess) : ''
				},
				properties : {
					itemId : JSON.stringify(item)
				}
			};
		});
		self.list.sections[0].setItems(items);
	};
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
			var data = JSON.parse(_e.itemId);
			if (data.duration) {
				require('ui/audioplayer.window').createAndStartPlayer({
					color : '#000',
					url : data.url,
					duration : data.duration,
					title : data.title,
					subtitle : Moment(data.pubdate).format('LLL') + ' Uhr',
					author : data.author,
					station : data.station,
					pubdate : data.pubdate
				});
			}
		}
	});
	self.addEventListener('focus', self.updateList);

	self.addEventListener('open', function(_event) {
		АктйонБар.title = 'DeutschlandRadio';
		АктйонБар.subtitle = 'Letztes/Unvollständiges/Offline';
		АктйонБар.titleFont = "Aller Bold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor('#444444');
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				activity.actionBar.displayHomeAsUp = true;
				activity.actionBar.onHomeIconItemSelected = function() {
					self.close();
				};
			};
			activity.invalidateOptionsMenu();
		}
	});
	return self;
};

