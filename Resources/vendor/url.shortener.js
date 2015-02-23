module.exports = function(_args) {
    var self = Ti.Network.createHTTPClient({
        onload : function() {
            _args.done(JSON.parse(this.responseText).id);
        }
    });
    self.open('POST', 'https://www.googleapis.com/urlshortener/v1/url');
    self.setRequestHeader('Content-Type', 'application/json');
    var payload = {
        longUrl : _args.url,
        key : Ti.App.Properties.getString('shorter')
    };
    self.send(JSON.stringify(payload));
};
