module.exports = function() {
    var url = "http://stream.dradio.de/7/530/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dkultur_m";
    var c = Titanium.Network.createHTTPClient({
        timeout : 10000
    });
    var filename = 'test.mp3';
    var f = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, filename);
    if (!f.exists()) {
        try {
            c.onload = function() {
                if (c.readyState == 4) {
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
                }
            };
            c.ondatastream = function(e) {
                console.log(e);
            };
            c.onerror = function(e) {
                Ti.API.info('XHR Error ' + e.error);
            };
            c.open('GET', url);
            c.send();
        } catch (e) {
            Ti.API.info("Error", Titanium.API.error);
        }
    }
};

var _ = {
    "totalCount" : -1,
    "blob" : {
        "file" : null,
        "nativePath" : null,
        "height" : 0,
        "length" : 1400,
        "width" : 0,
        "mimeType" : "audio/mpeg",
        "apiName" : "Ti.Blob",
        "text" : null,
        "type" : 2,
        "bubbleParent" : true
    },
    "source" : {
        "responseText" : "",
        "status" : 200,
        "autoRedirect" : true,
        "timeout" : 10000,
        "bubbleParent" : true,
        "readyState" : 3,
        "location" : "http://stream.dradio.de/7/530/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dkultur_m",
        "apiName" : "Ti.Network.HTTPClient",
        "domain" : null,
        "connectionType" : "GET",
        "username" : null,
        "validatesSecureCertificate" : false,
        "password" : null,
        "allResponseHeaders" : ["Content-Type:audio/mpeg", "icy-br:128", "ice-audio-info:ice-samplerate=44100;ice-bitrate=128;ice-channels=2", "icy-br:128", "icy-description:Deutschlandradio Kultur - MP3", "icy-genre:News", "icy-name:Deutschlandradio Kultur - MP3", "icy-private:0", "icy-pub:1", "icy-url:http://www.dradio.de", "Server:Akacast 1.0", "Cache-Control:no-cache"],
        "responseXML" : null,
        "responseData" : null,
        "autoEncodeUrl" : true,
        "statusText" : "OK",
        "connected" : true,
        "_events" : {
            "disposehandle" : {}
        }
    },
    "size" : 1400,
    "progress" : -502569,
    "totalSize" : 502569
};
