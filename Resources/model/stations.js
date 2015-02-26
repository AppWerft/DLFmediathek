module.exports = {
    dlf : {
        color : '#006AB3',
        /* für Tagesübersicht, wird auch in der Mediathek genutzt und einaml täglich über
         einen Hintergrundprozess gesynct*/
        rss : 'http://www.deutschlandfunk.de/programmvorschau.281.de.rss',
        /* für LiveRadio, eigentlicher Stream wird ermittelt und gespeichert*/
        livestream : 'http://www.dradio.de/streaming/dlf.m3u',
        /* wird jede Minutre aufgerufen, wenn View aktiv ist */
        livemediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=4&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    },
    drk : {
        color : '#E95D0F',
        hoerkunst : 'http://www.deutschlandradiokultur.de/hoerkunst.1656.de.html',
        rss: 'http://www.deutschlandradiokultur.de/programmvorschau.282.de.rss',
        livestream : 'http://www.dradio.de/streaming/dkultur.m3u',
        livemediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=3&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    },
    drw : {
        color : '#01953C',
        livestream : 'http://www.deutschlandradio.de/streaming/dradiowissen.m3u',
        livemediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=1&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    }
};

