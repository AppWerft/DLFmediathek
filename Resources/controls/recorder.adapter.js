var URL = 'http://dradio_mp3_dlf_m.akacast.akamaistream.net/7/249/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dlf_m';
var HOST = 'dradio_mp3_dlf_m.akacast.akamaistream.net';

module.exports = function(_args) {
    var socket = Ti.Network.Socket.createTCP({
        host : 'blog.example.com',
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
            // hier blockweise lesen und speichern und irgendwann beenden, aber wie?
        } catch (ex) {
            Ti.API.error(ex);
        }
    }

};

/*
 socket.connect();

 function writeCallback(e) {
 Ti.API.info('Successfully wrote to socket.');
 }

 function readCallback(e) {
 if (e.bytesProcessed == -1)
 {
 // Error / EOF on socket. Do any cleanup here.

 }
 try {
 if(e.buffer) {
 var received = e.buffer.toString();
 Ti.API.info('Received: ' + received);
 } else {
 Ti.API.error('Error: read callback called with no buffer!');
 }
 } catch (ex) {
 Ti.API.error(ex);
 }
 }
 */
