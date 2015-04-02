var URL = 'http://dradio_mp3_dlf_m.akacast.akamaistream.net/7/249/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dlf_m';

module.exports = function(_args) {
    var socket = Ti.Network.Socket.createTCP({
        host : 'dradio_mp3_dlf_m.akacast.akamaistream.net',
        port : 80,
        connected : function(e) {
            Ti.API.info('Socket opened!');
            Ti.Stream.pump(e.socket, readCallback, 1024, true);
            Ti.Stream.write(socket, Ti.createBuffer({
                value : 'GET '+URL+ ' HTTP/1.1\r\n\r\n'
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
            
            var instream = Ti.Stream.createStream({
    mode : Ti.Stream.MODE_READ,
    source : this.responseData
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

            // hier blockweise lesen und speichern und irgendwann beenden, aber wie?
        } catch (ex) {
            Ti.API.error(ex);
        }
    }
};

