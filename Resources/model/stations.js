module.exports = {
	dlf : {
		color : '#198AFF',
		name : 'Deutschlandfunk',
		dayplan : 'http://www.deutschlandfunk.de/programmvorschau.281.de.rss',
		/* für LiveRadio, eigentlicher Stream wird ermittelt und gespeichert*/
		playlist : 'http://www.dradio.de/streaming/dlf.m3u',
		icyurl : ['icy://dradio_mp3_dlf_m.akacast.akamaistream.net/7/249/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dlf_m'],
		/* wird jede Minute aufgerufen, wenn View aktiv ist */
		mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=4&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
	},
	drk : {
		color : '#FF6400	',
		name : 'Dlf Kultur',
		dayplan : 'http://www.deutschlandfunkkultur.de/programmvorschau.282.de.rss',
		playlist : 'http://www.dradio.de/streaming/dkultur.m3u',
		icyurl : ['icy://dradio_mp3_dkultur_m.akacast.akamaistream.net/7/530/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dkultur_m'],
		mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=3&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
	},
	drw : {
		color : '#FF01953C',
		name : 'Dlf Nova',
		icyurl : ['http://dradio_mp3_dwissen_m.akacast.akamaistream.net/7/728/142684/v1/gnl.akacast.akamaistream.net/dradio_mp3_dwissen_m'],
		mediathek : 'http://srv.deutschlandradio.de/aodlistaudio.1706.de.rpc?drau:station_id=1&drau:from=_DATE_&drau:to=_DATE_&drau:page=1&drau:limit=500'
	}
	
};

