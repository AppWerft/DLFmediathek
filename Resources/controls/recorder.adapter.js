/*
 call parameters :

 url
 duration

 **/

module.exports = function(_args) {
    if (!_args.url)
        _args.url = URL;
    if (!_args.duration)
        _args.duration = 10000;
    var f = Ti.Filesystem.getFile((Ti.Filesystem.isExternalStoragePresent()) ? Ti.Filesystem.externalStorageDirectory : Ti.Filesystem.applicationDataDirectory, 'test.mp3');
    var regex = /^(?:([^\:]*)\:\/\/)?(?:([^\:\@]*)(?:\:([^\@]*))?\@)?(?:([^\/\:]*)\.(?=[^\.\/\:]*\.[^\.\/\:]*))?([^\.\/\:]*)(?:\.([^\/\.\:]*))?(?:\:([0-9]*))?(\/[^\?#]*(?=.*?\/)\/)?([^\?#]*)?(?:\?([^#]*))?(?:#(.*))?/;
    var res = _args.url.match(regex);
    _args.host = [res[4], res[5], res[6]].join('.');
    _args.port = res[7] || 80;
    _args.path = res[8] + res[9];
    var socket = Ti.Network.Socket.createTCP({
        host : _args.host,
        port : _args.port,
        connected : function(e) {
            Ti.Stream.pump(e.socket, readCallback, 1024, true);
            Ti.Stream.write(socket, Ti.createBuffer({
                value : 'GET ' + _args.path + ' HTTP/1.1\r\n\r\n'
            }), writeCallback);
        },
        error : function(e) {
            Ti.API.info('Error (' + e.errorCode + '): ' + e.error);
        },
    });
    socket.connect();
    var instream,
        outstream;
    function writeCallback(e) {
        Ti.API.info('Successfully wrote GET request to shoutcast server');
    }

    function readCallback(e) {
        if (e.bytesProcessed == -1) {
            console.log(e);
            setTimeout(function() {
                socket && socket.close();
                instream && instream.close();
                outstream && outstream.close();
            }, _args.duration);
        }
        try {

            if (e.buffer) {
                instream = Ti.Stream.createStream({
                    mode : Ti.Stream.MODE_READ,
                    source : e.buffer
                });
                outstream = f.open(Ti.Filesystem.MODE_WRITE);
                var buffer = Ti.createBuffer({
                    length : 1024
                });
                var read_bytes = 0;
                while (( read_bytes = instream.read(buffer)) > 0) {
                    console.log(read_bytes);
                    outstream.write(buffer, 0, read_bytes);
                }
                instream.close();
                outstream.close();
            } else {
                Ti.API.error('Error: read callback called with no buffer!');
            }
            // hier blockweise lesen und speichern und irgendwann beenden, aber wie?
        } catch (ex) {
            Ti.API.error(ex);
        }
    }

};

