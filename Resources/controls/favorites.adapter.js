/*
 This model is for persisting of items in timeline (mediathek)  
 * */

const DB = Ti.App.Properties.getString('DATABASE');

var Module = function() {
    var link = Ti.Database.open(DB);
    link.execute('CREATE TABLE IF NOT EXISTS "fav" ("pubdate" DATETIME, "station" VARCHAR, "count" INTEGER, "json" TEXT);');
    link.close();
};

Module.prototype = {
    addFav : function(_item) {
        var link = Ti.Database.open(DB);
        link.execute('insert into fav (pubdate,station,json) values (?,?,?)', _item.datetime, _item.station, JSON.stringify(_item));
        link.close();
    },
    savePlaytime : function(_item) {
        var link = Ti.Database.open(DB);
        var sql = 'update fav set count='+_item.count+' where station="' + _item.station + '" and pubdate="' + _item.datetime + '"';
        link.execute(sql);
        link.close();
    },
    killFav : function(_item) {
        var link = Ti.Database.open(DB);
        var sql = 'delete from fav where station="' + _item.station + '" and pubdate="' + _item.datetime + '"';
        link.execute(sql);
        link.close();
    },
    toggleFav : function(_item) {
        if (this.isFav(_item)) {
           this.killFav(_item);
        } else {
            this.addFav(_item);
        }  
        return this.isFav(_item)  ;
    },
    getAllFavs : function() {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select * from fav order by pubdate desc');
        var items = [];
        while (rows.isValidRow()) {
            var item = JSON.parse(rows.fieldByName('json'));
            item.count = rows.fieldByName('count') || 0;
            items.push(item);
            rows.next();
        }
        rows.close();
        link.close();
        return items;
    },
    isFav : function(_item) {
        var link = Ti.Database.open(DB);
        var rows = link.execute('select * from fav where station=? and pubdate=?', //
        _item.station, _item.datetime);
        var found = rows.rowCount ? true : false;
        rows.close();
        link.close();
        return found;
    },
};

module.exports = Module;
