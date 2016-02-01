var Model = require('model/stations'),
    Feeds = new (require('controls/feed.adapter'))(),
    Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function() {
	var station = 'dlf';
	var self = require('ui/generic.window')({
		title : 'DeutschlandRadio',
		subtitle : 'Meine Podcasts',
		station : null,
		singlewindow : true,
		fullscreen : false
	});
	self.list = Ti.UI.createListView({
		templates : {
			'mypodcasts' : require('TEMPLATES').mypodcasts,
		},
		defaultItemTemplate : 'mypodcasts',
		sections : [Ti.UI.createListSection({})]
	});
	self.add(self.list);
	function updateList() {
		var dataItems = Feeds.getAllFavedFeeds().map(function(item) {
			return {
				properties : {
					accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE,
					itemId : JSON.stringify(item),
				},
				lastbuilddate : {
					text : 'Letzter Beitrag:\n' + Moment(item.lastpubdate).format('LLLL') + ' Uhr'
				},
				total : {
					text : 'Anzahl der Beiträge: ' + item.total
				},
				title : {
					text : item.title
				},
				description : {
					html : item.description,
				},
				logo : {
					image : item.image,
					defaultImage : '/images/' + station + '.png'
				},
				cached : {
					opacity : 0
				}
			};
		});
		self.list.sections[0].setItems(dataItems);
	}

	updateList();
	self.list.addEventListener('itemclick', function(_e) {
		require('ui/podcastlist.window')(JSON.parse(_e.itemId)).open();
	});
	return self;
};

