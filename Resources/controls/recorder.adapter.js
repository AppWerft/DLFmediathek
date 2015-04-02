/*
 call parameters :

 url
 duration

 **/
const BLOCKSIZE = 1024;
const DURATION = 10000;
var moment = require('vendor/moment');

module.exports = function(_args) {
    if (!_args.url)
        _args.url = URL;
    if (!_args.duration)
        _args.duration = DURATION;
    var mp3file = Ti.Filesystem.getFile((Ti.Filesystem.isExternalStoragePresent()) ? Ti.Filesystem.externalStorageDirectory : Ti.Filesystem.applicationDataDirectory, moment().format('YYYY-MM-DD_HHmm') + '.mp3');
    var regex = /^(?:([^\:]*)\:\/\/)?(?:([^\:\@]*)(?:\:([^\@]*))?\@)?(?:([^\/\:]*)\.(?=[^\.\/\:]*\.[^\.\/\:]*))?([^\.\/\:]*)(?:\.([^\/\.\:]*))?(?:\:([0-9]*))?(\/[^\?#]*(?=.*?\/)\/)?([^\?#]*)?(?:\?([^#]*))?(?:#(.*))?/;
    var res = _args.url.match(regex);
    _args.host = [res[4], res[5], res[6]].join('.');
    _args.port = res[7] || 80;
    _args.path = res[8] + res[9];
    var socket = Ti.Network.Socket.createTCP({
        host : _args.host,
        port : _args.port,
        connected : function(e) {
            Ti.Stream.pump(e.socket, function(_pump) {
                console.log(_pump.error);
                console.log(_pump.totalBytesProcessed);
                try {
                    if (_pump.buffer) {
                        var foo_stream = Ti.Stream.createStream({
                            mode : Ti.Stream.MODE_READ  ,
                            source : _pump.buffer
                        });
                        var bar_stream = mp3file.open(Ti.Filesystem.MODE_APPEND);
                        var buffer = Ti.createBuffer({
                            length : BLOCKSIZE
                        });
                        var read_bytes = 0;
                        while (( read_bytes = foo_stream.read(buffer)) > 0) {
                            bar_stream.write(buffer, 0, read_bytes);
                        }
                        foo_stream.close();
                        bar_stream.close();
                    } else {
                        Ti.API.error('Error: read callback called with no buffer!');
                    }
                } catch (ex) {
                    console.log('exception');
                    Ti.API.error(ex);
                } 
            }, BLOCKSIZE, true);
            Ti.Stream.write(e.socket, Ti.createBuffer({
                value : 'GET ' + _args.path + ' HTTP/1.1\r\n\r\n'
            }), function(_write) {
                Ti.API.info('Successfully wrote GET request to shoutcast server');
            });

        },
        error : function(e) {
            Ti.API.info('Error (' + e.errorCode + '): ' + e.error);
        },
    });
    socket.connect();

    setTimeout(function() {
        !!socket && socket.close();
    }, _args.duration);
};

