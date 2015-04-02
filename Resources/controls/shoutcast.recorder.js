/*
 call parameters :

 url
 duration

 **/
const BLOCKSIZE = 1024;
var moment = require('vendor/moment');

module.exports = function(_args) {
    if (!_args.url)
        _args.url = URL;
    if (!_args.duration)
        _args.duration = 5000;
    var f = Ti.Filesystem.getFile((Ti.Filesystem.isExternalStoragePresent()) ? Ti.Filesystem.externalStorageDirectory : Ti.Filesystem.applicationDataDirectory, moment().format('YYYY-MM-DD_HHmm') + '.mp3');
    var regex = /^(?:([^\:]*)\:\/\/)?(?:([^\:\@]*)(?:\:([^\@]*))?\@)?(?:([^\/\:]*)\.(?=[^\.\/\:]*\.[^\.\/\:]*))?([^\.\/\:]*)(?:\.([^\/\.\:]*))?(?:\:([0-9]*))?(\/[^\?#]*(?=.*?\/)\/)?([^\?#]*)?(?:\?([^#]*))?(?:#(.*))?/;
    var res = _args.url.match(regex);
    _args.host = [res[4], res[5], res[6]].join('.');
    _args.port = res[7] || 80;
    _args.path = res[8] + res[9];
    var socket = Ti.Network.Socket.createTCP({
        host : _args.host,
        port : _args.port,
        connected : function(e) {
            Ti.Stream.pump(e.socket, function(_read) {
                try {
                    if (_read.buffer) {
                        var instream = Ti.Stream.createStream({
                            mode : Ti.Stream.MODE_READ,
                            source : _read.buffer
                        });
                        var outstream = f.open(Ti.Filesystem.MODE_APPEND);
                        var buffer = Ti.createBuffer({
                            length : BLOCKSIZE
                        });
                        var read_bytes = 0;
                        while (( read_bytes = instream.read(buffer)) > 0) {
                            outstream.write(buffer, 0, read_bytes);
                        }
                        instream.close();
                        outstream.close();
                    } else {
                        Ti.API.error('Error: read callback called with no buffer!');
                    }
                } catch (ex) {
                    console.log('excepetion');
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

