module.exports = function(args) {
    if (args.stream) {
        args.onload(args.stream);
    } else {
        if (Ti.App.Properties.hasProperty(args.playlist)) {
        	var url = Ti.App.Properties.getString(args.playlist);
        	console.log('Info: using of cached URL '+ url);
            args.onload(url);
            return;
        }
        var uri_pattern = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
        var xhr = Ti.Network.createHTTPClient({
            timeout : 6000,
            onload : function() {
                if (this.status == 200) {
                    if (/url/.test(this.getResponseHeader('Content-Type'))) {
                        var foo = this.responseText.split('\n');
                        var bar = [];
                        for (var i = 0; i < foo.length; i++) {
                            if (foo[i][0] == '#')
                                continue;
                            var uri = foo[i].match(uri_pattern);
                            if (uri)
                                bar.push(uri);
                        }
                        args.onload(bar[0][0]);
                        Ti.UI.createNotification({
                            message : 'RadioAdresse gemerkt.\nNächste Radiostarts sind beschleunigt.'
                        }).show();
                        Ti.App.Properties.setString(args.playlist, bar[0][0]);
                    } else {
                        xhr.abort();
                        console.log('no header');
                        args.onload(args.playlist);
                    }
                } else {
                    args.onerror();
                }
            },
            onerror : function() {
                args.onerror();
            }
        });
        xhr.open('GET', args.playlist);
        xhr.send();

    }
};

