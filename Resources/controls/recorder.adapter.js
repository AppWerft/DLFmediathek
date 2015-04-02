var URL = 'http://dradio_mp3_dlf_m.akacast.akamaistream.net/7/249/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dlf_m';

module.exports = function(_args) {
    if (!_args.url)
        _args.url = URL;
   
    var f = Ti.Filesystem.getFile((Ti.Filesystem.isExternalStoragePresent())? Ti.Filesystem.externalStorageDirectory:Ti.Filesystem.applicationDataDirectory, 'test.mp3');
    var regex = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)(:([^\/]*))?((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(\?([^#]*))?(#(.*))?$/;
    var res = _args.match(regex);
    var url = {
        port : res[2],
        host : res[1],
        path : res[3]
    };
    var socket = Ti.Network.Socket.createTCP({
        host : url.host,
        port : url.port,
        connected : function(e) {
            Ti.API.info('Socket opened!');
            Ti.Stream.pump(e.socket, readCallback, 1024, true);
            Ti.Stream.write(socket, Ti.createBuffer({
                value : 'GET ' + URL + ' HTTP/1.1\r\n\r\n'
            }), writeCallback);
        },
        error : function(e) {
            Ti.API.info('Error (' + e.errorCode + '): ' + e.error);
        },
    });
    socket.connect();

    function writeCallback(e) {
        Ti.API.info('Successfully wrote to socket.');
    }

    function readCallback(e) {
        if (e.bytesProcessed == -1) {
            // Error / EOF on socket. Do any cleanup here.
        }
        try {
            if (e.buffer) {
                var instream = Ti.Stream.createStream({
                    mode : Ti.Stream.MODE_READ,
                    source : e.buffer
                });
                var outstream = f.open(Ti.Filesystem.MODE_WRITE);
                var buffer = Ti.createBuffer({
                    length : 1024
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
            // hier blockweise lesen und speichern und irgendwann beenden, aber wie?
        } catch (ex) {
            Ti.API.error(ex);
        }
    }

};

