const DB = 'DB1';

var Module = function() {
    var link = Ti.Database.open(DB);
    link.execute('CREATE TABLE IF NOT EXISTS "fav" ("pubdate" DATETIME, "station" VARCHAR, "count" INTEGER, "json" TEXT);');
    link.close();
};

Module.prototype = {
    addFav : function(_item) {
        console.log(_item);
        var link = Ti.Database.open(DB);
        link.execute('insert into fav (pubdate,station,json) values (?,?,?)', _item.datetime, _item.station, JSON.stringify(_item));
        link.close();
    },
    killFav : function(_item) {
        var link = Ti.Database.open(DB);
        var sql = 'delete from fav where station="' + _item.station + '" and pubdate="' + _item.datetime + '"';
        console.log(sql);
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
        var rows = link.execute('select * from fav');
        var items = [];
        while (rows.isValidRow()) {
            items.push(JSON.parse(rows.fieldByName('json')));
            rows.next();
        }
        rows.close();
        link.close();
        return items;
    },
    isFav : function(_item) {
        console.log(_item);
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
