module.exports = function() {
    var url = "http://stream.dradio.de/7/530/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dkultur_m";
    var client = Ti.Network.createHTTPClient({

        onerror : function(e) {
            Ti.API.debug(e.error);
            alert('error');
        }
    });
    client.file = Ti.Filesystem.getFile(Ti.Filesystem.getExternalStorageDirectory(), 'test.mp3');
    client.open("GET", url);
    client.setRequestHeader('Icy-MetaData', 1);
    client.send();
    setTimeout(function() {
        client.abort();
    }, 10000);
};
