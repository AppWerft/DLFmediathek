var Model = require('model/stations'),
    Feeds = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment');
Moment.locale('de');
АктйонБар = require('com.alcoapps.actionbarextras'), module.exports = function() {
	var station;
	var self = require('ui/generic.window')({
		title : 'Meine Podcasts',
		station : null,
		singlewindow : true,
		fullscreen : false
	});
	self.list = Ti.UI.createListView({
		templates : {
			'mypodcasts' : require('TEMPLATES').mypodcasts,
		},
		top : 80,
		defaultItemTemplate : 'mypodcasts',
		sections : [Ti.UI.createListSection({})]
	});
	self.add(self.list);
	function updateList() {
		var dataItems = Feeds.getAllFavedFeeds().map(function(item) {
			var image = '/images/' + item.station + '.png';
			return {
				properties : {
					accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
					itemId : JSON.stringify(item),
				},
				lastbuilddate : {
					text : 'Letzter Beitrag: ' + Moment(item.lastpubdate).format('LL')
				},
				total : {
					text : 'Anzahl der Beiträge: ' + item.total
				},
				title : {
					text : clean(item.title),
					color: (item.station)? Model[item.station].color : "black"
					
									},
				description : {
					html : clean(item.description),
				},
				logo : {
					
					image : image
				},
				cached : {
					opacity : 0
				}
			};
		});
		self.list.sections[0].setItems(dataItems);
	}


	self.addEventListener('focus', updateList);
	
	self.list.addEventListener('itemclick', function(_e) {
		require('ui/podcast/list.window')(JSON.parse(_e.itemId)).open();
	});
	self.addEventListener('open', function(_event) {
		АктйонБар.titleFont = "ScalaSansBold";
		АктйонБар.subtitleColor = "#ccc";
		АктйонБар.setBackgroundColor('#444444');
		АктйонБар.setStatusbarColor('#444444');
	});
	return self;
};

