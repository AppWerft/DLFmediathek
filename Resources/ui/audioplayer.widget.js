var Player = function() {
    this._player = Ti.Media.createAudioPlayer({
        allowBackground : true,
        volume : 1
    });
    var that = this;
    this._player.addEventListener('progress', function(_e) {
        that._progress.setValue(_e.progress / 1000);
    });
    this._player.addEventListener('complete', function(_e) {
        Ti.API.error(_e.error);
        Ti.API.error('completed code = ' + _e.code);
        that._player.release();
        that._view.setVisible(false);
    });
    this._player.addEventListener('change', function(_e) {
        Ti.API.error(_e.state + '    ' + _e.description);
        switch (_e.description) {
        case 'initialized':
            that._control.image = '/images/stop.png';
            Ti.Media.vibrate();
            break;
        case 'stopped':
            that._equalizer.opacity = 0;
            that._control.image = '/images/play.png';
            break;
        case 'stopping':
            that._equalizer.opacity = 0;
            that._control.image = '/images/leer.png';
            break;
        case 'starting':
            that._control.image = '/images/leer.png';
            break;
        case 'paused':
            that._equalizer.opacity = 0;
            that._control.image = '/images/play.png';
            break;
        case 'playing':
            that._equalizer.animate({
                opacity : 1,
                duration : 700
            });
            that._control.image = '/images/pause.png';
            break;
        }
    });
    return this;
};
Player.prototype = {
    createView : function(args) {
        this._view = Ti.UI.createView({
            visible : false
        });
        this._view.add(Ti.UI.createView({
            opacity : 0.5,
            touchEnabled : false,
            backgroundColor : (args.color) ? args.color : 'black'
        }));
        this._view.add(Ti.UI.createView({
            opacity : 0.5,
            touchEnabled : false,
            backgroundColor : 'black'
        }));
        this._container = Ti.UI.createView({
            bubbleParent : false,
            touchEnabled : false,
            height : 150,
            bottom : 0,
            backgroundColor : 'white'
        });
        this._view.add(this._container);
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
            bubbleParent : false,
            touchEnabled : false,
            font : {
                fontSize : 10
            },
            right : 10,
        });
        this._title = Ti.UI.createLabel({
            bottom : 70,
            bubbleParent : false,
            touchEnabled : false,
            color : '#555',
            height : 36,
            height : Ti.UI.SIZE,
            font : {
                fontSize : 18,
                fontWeight : 'bold',
                fontFamily : 'Aller-Bold'
            },
            left : 10,
        });
        this._control = Ti.UI.createImageView({
            width : 50,
            height : 50,
            bubbleParent : false,
            left : 10,
            image : '/images/play.png',
            bottom : 15
        });
        this._equalizer = Ti.UI.createWebView({
            borderRadius : 1,
            width : 200,
            height : 33,
            bubbleParent : false,
            touchEnabled : false,
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
            if (that._player.isPlaying()) {
                that._player.pause();
            } else if (that._player.isPaused()) {
                that._player.play();
            }
        });
        this._view.addEventListener('click', function() {
            Ti.API.error('Info: background of player clicked');
            that.stopPlayer();
        });
        return this._view;
    },
    startPlayer : function(args) {
        if (Ti.Network.online != true) {
            Ti.UI.createNotification({
                message : 'Bitte Internetverbindung prüfen'
            }).show();
            this.stopPlayer();
            return;
        }
        Ti.App.fireEvent('app:stop');
        this._view.setVisible(true);
        this._progress.setMax(args.sec);
        this._progress.setValue(0);
        this._player.setUrl(args.url+ '?_='+Math.random());
        Ti.API.error(args.url);
        this._title.setText(args.title);
        this._duration.setText(args.duration);
        this._view.add(this._equalizer);
        this._player.start();
    },
    stopPlayer : function(args) {
        if (this._player.isPlaying() || this._player.isPaused()) {
            Ti.API.error('Info: try 2 stop player - was playing or paused');
            this._player.stop();
            this._player.release();
        }
        this._view.setVisible(false);
    }
};

exports.createPlayer = function() {
    return new Player();
};
