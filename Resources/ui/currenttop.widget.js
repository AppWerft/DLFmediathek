var Moment = require('vendor/moment');

var Module = function(_args) {
	this._view = Ti.UI.createScrollView({
		scrollType : 'vertical',
		contentHeight : Ti.UI.SIZE,
		backgroundColor : '#444',
		layout : 'vertical',
	});
	this._view.pubdate = Ti.UI.createLabel({
		right : 50,
		top : 4,
		text : '',
		color : '#eee',
		font : {
			fontSize : 16,
			fontFamily : 'Aller'
		},
	});
	this._view.title = Ti.UI.createLabel({
		left : 10,
		top : -2,
		text : '',
		font : {
			fontSize : 20,
			fontFamily : 'Aller Bold'
		},
		right : 50
	});
	this._view.progress = Ti.UI.createProgressBar({
		left : 10,
		top : -10,
		text : '',
		height : 25,
		min : 0,
		max : 1,
		value : 0.1,
		visible : true,
		right : 50
	});
	this._view.radiotext = Ti.UI.createLabel({
		top : 5,
		height : 30,
		color : '#eee',
		width : Ti.UI.FILL,
		textAlign : 'left',
		left : 10,
		right : 50,
		ellipsize : Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_MARQUEE,
		horizontalWrap : false,
		font : {
			fontSize : 16,
			fontFamily : 'Aller Bold'
		}
	});
	this._view.description = Ti.UI.createLabel({
		left : 10,
		right : 50,
		top : -40,
		html : '',
		bottom : 100,
		color : '#eee'
	});
	this._view.add(this._view.pubdate);
	this._view.add(this._view.title);
	this._view.add(this._view.progress);
	this._view.add(this._view.radiotext);
	this._view.add(this._view.description);
	var that = this;
	Ti.App.addEventListener('radiotext', function(_e) {
		if (_e.message == null) {
			that._view.radiotext.setText('');
		} else {
			that._view.radiotext.setText(_e.message);
		}
	});
	this._view.addEventListener('click', function() {
		require('ui/dayplan.window')({
			station : _args.station
		}).open();
	});
	return this;
};

Module.prototype = {
	createView : function(_args) {
		this._view.setTop(-_args.height);
		this._view.title.setColor(_args.color);
		this._view.setHeight(_args.height);
		return this._view;
	},
	addBanner : function() {
		this._view.removeAllChildren();
		var banner = Ti.UI.createImageView({
			image : 'http://static.dradiowissen.de/banner/2015_early_bird.jpg',
			top : 0,
			width : Ti.UI.FILL
		});
		this._view.add(banner);
	},
	setPubDate : function(msg) {
		this._view.pubdate.setText('seit: ' + Moment(msg).format('HH:mm') + ' Uhr');
	},
	setTitle : function(msg) {
		this._view.title.setText(arguments[0]);
	},
	setProgress : function(msg) {
		this._view.progress.setValue(arguments[0]);
	},
	setDescription : function(msg) {
		if ( typeof arguments[0] == 'string')
			this._view.description.setHtml(msg);
		else
			this._view.description.setHtml('');
	}
};

module.exports = Module;
