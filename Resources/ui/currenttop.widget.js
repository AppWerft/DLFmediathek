
var Moment = require('vendor/moment');

var Module = function() {
    this._view = Ti.UI.createScrollView({
        scrollType : 'vertical',
        contentHeight : Ti.UI.SIZE,
        backgroundColor : '#444',
        layout : 'vertical',
    });
    this._view.pubdate = Ti.UI.createLabel({
        right : 50,
        top : 7,
        text : 'Sendungsbeginn',
        color : '#eee',
        font : {
            fontSize : 16,
            fontFamily : 'ScalaSans'
        },
    });
    this._view.title = Ti.UI.createLabel({
        left : 10,
        top : -5,
       
        text : 'Titel der Sendung',
        font : {
            fontSize : 20,
            fontFamily : 'ScalaSansBold'
        },
        right : 50

    });
    this._view.description = Ti.UI.createLabel({
        left : 10,
        right : 50,
        top : -10,
        html : 'Vollbeschreibung',
        bottom : 100,
        color : '#eee'
    });
    this._view.add(this._view.pubdate);
    this._view.add(this._view.title);
    this._view.add(this._view.description);
    return this;
};

Module.prototype = {
    createView : function(_args) {
        this._view.setTop(-_args.height);
        this._view.title.setColor(_args.color);
        this._view.setHeight(_args.height);
        return this._view;
    },
    setPubDate : function(msg) {
        this._view.pubdate.setText('seit: ' + Moment(msg).format('HH:mm') + ' Uhr');
    },
    setTitle : function(msg) {
        this._view.title.setText(arguments[0]);
    },
    setDescription : function(msg) {
        typeof arguments[0] == 'string' && this._view.description.setHtml(msg);
    }
};

module.exports = Module;
