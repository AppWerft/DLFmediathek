module.exports = {
    dlf : {
        color : '#FF006AB3',
        name: 'Deutschlandfunk',
        /* für Tagesübersicht, wird auch in der Mediathek genutzt und einaml täglich über
         einen Hintergrundprozess gesynct*/
        dayplan: 'http://www.deutschlandfunk.de/programmvorschau.281.de.rss',
        /* für LiveRadio, eigentlicher Stream wird ermittelt und gespeichert*/
        stream : 'http://www.dradio.de/streaming/dlf.m3u',
        /* wird jede Minute aufgerufen, wenn View aktiv ist */
        mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=4&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    },
    drk : {
        color : '#FFE95D0F',
        name : 'DRadio Kultur',
        dayplan: 'http://www.deutschlandradiokultur.de/programmvorschau.282.de.rss',
        stream : 'http://www.dradio.de/streaming/dkultur.m3u',
        mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=3&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    },
    drw : {
        color : '#FF01953C',
        name :'DRadio Wissen',
        stream : 'http://www.deutschlandradio.de/streaming/dradiowissen.m3u',
        mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=1&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
    }
};

