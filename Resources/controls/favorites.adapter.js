const DB = 'DB';

var Module = function() {
    var link = Ti.Database.install('/model/dlr.sql', DB);
    link.close();
};

Module.prototype = {
    addFav : function(_item) {
        var link = Ti.Database.open(DB);
        link.execute('insert into fav (pubdate,station,json) values (?,?,?)', _item.pubdate, _item.station, JSON.stringify(_item));
        link.close();
    },
    killFav : function(_item) {
        var link = Ti.Database.open(DB);
        link.execute('delete from fav where station=? and pubdate=?', _item.station, _item.pubdate);
        link.close();
    },
    getAll : function() {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select * from fav');
        var items = [];
        while (rows.isValidRow()) {
            items.push(JSON.parse(rows.fieldByName('json')));
            rows.next();
        }
        rows.close();
        link.close();
    },
    isFav : function(_item) {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select count * from fav where station=? and pubdate=?', _item.station, _item.pubdate);
        var found = rows.rowCount ? true : false;
        rows.close();
        link.close();
        return found;
    },
};

module.exports = Module;
