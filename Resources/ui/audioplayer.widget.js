var Module = function() {
    this._player = Ti.Media.createAudioPlayer({
        allowBackground : true
    });
    var that = this;
    this._player.addEventListener('progress', function(_e) {
        that._progress.setValue(_e.progress / 1000);
    });
    this._player.addEventListener('complete', function(_e) {
        that._player.release();
        that._view.setVisible(false);
    });
    this._player.addEventListener('change', function(_e) {
        Ti.API.error(_e.state + '    ' + _e.description);
        switch (_e.state) {
        case 5:
            that._equalizer.animate({
                opacity : 0
            });
             that._control.image = '/images/play.png';
            break;
        case 3:
            that._equalizer.animate({
                opacity : 1
            });
            that._control.image = '/images/pause.png';
            break;
        }
    });
    return this;
};
Module.prototype = {
    createView : function(args) {
        this._view = Ti.UI.createView({
            visible : false
        });
        this._view.add(Ti.UI.createView({
            opacity : 0.5,
            backgroundColor : (args.color) ? args.color : 'black'
        }));
        this._view.add(Ti.UI.createView({
            opacity : 0.5,
            backgroundColor : 'black'
        }));
        this._view.add(Ti.UI.createView({
            bubbleParent : false,
            height : 120,
            bottom : 0,
            backgroundColor : 'white'
        }));
        this._progress = Ti.UI.createProgressBar({
            bottom : 20,
            left : 80,
            right : 10,
            height : 30,
            width : Ti.UI.FILL,
            min : 0,
            max : 100
        });
        this._duration = Ti.UI.createLabel({
            bottom : 5,
            font : {
                fontSize : 10
            },
            right : 10,
        });
        this._title = Ti.UI.createLabel({
            bottom : 70,
            color : '#555',
            height : 36,
            height : Ti.UI.SIZE,
            font : {
                fontSize : 18,
                fontWeight : 'bold',
                fontFamily : 'ScalaSansBold'
            },
            left : 10,
        });
        this._control = Ti.UI.createImageView({
            width : 50,
            height : 50,
            left : 10,
            image : '/images/play.png',
            bottom : 15
        });
        this._equalizer = Ti.UI.createWebView({
            borderRadius : 1,
            width : 200,
            height : 33,
            scalesPageToFit : true,
            url : '/images/equalizer.gif',
            bottom : 30,
            left : 80,
            opacity : 0,
            enableZoomControls : false
        });
        this._view.add(this._progress);
        this._view.add(this._duration);
        this._view.add(this._title);
        this._view.add(this._control);

        var that = this;
        this._control.addEventListener('click', function() {
            that._player.stop();
            that._player.release();
            that._view.setVisible(false);
        });

        return this._view;
    },
    startPlayer : function(args) {
        console.log(args);
        this._view.setVisible(true);
        this._progress.setMax(args.sec);
        this._player.setUrl(args.url);
        this._title.setText(args.title);
        this._duration.setText(args.duration);
        this._view.add(this._equalizer);

        this._player.start();
    }
};

module.exports = Module;
