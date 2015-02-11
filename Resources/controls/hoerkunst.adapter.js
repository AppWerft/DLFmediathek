var Moment = require('vendor/moment');

module.exports = function(_args) {
    var xhr = Ti.Network.createHTTPClient({
        onload : function() {
            var page = this.responseText.replace(/>[\s]+</gm, '><'),
                regex = new RegExp(/<article.*?>(.*?)<\/article>/gm),
                match = '';
            while ( match = regex.exec(page)) {
                console.log(match[1]);
            };
            _args.done(match);
        }
    });
    xhr.open('GET', _args.url);
    xhr.send();
};
