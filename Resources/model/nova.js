module.exports = {
	einhundert : {
		banner : "/images/podcasts/100banner.jpg",
		title : "Einhundert",
		color : "#FCFCFA"
	},
	"hoersaal" : {
		banner : "/images/podcasts/hoersaal.jpg",
		title : "Hörsaal",
		color : "#EBE8D8"
	},
	"eine-stunde-film" : {
		banner : "/images/podcasts/filmbanner.jpg",
		title : "Eine Stunde Film",
		color : "#50B95C"
	},
	"redaktionskonferenz" : {
		banner : "/images/podcasts/redaktionskonferenz.jpg",
		title : "Redaktionskonferenz",
		color : "#CEDCCF"
	},

	"eine-stunde-talk" : {
		banner : "/images/podcasts/eine-stunde-talk.jpg",
		title : "Ein Stunde Talk",
		color : "#F2CC3B"
	},
	"eine-stunde-medien" : {
		banner : "/images/podcasts/eine-stunde-medien.jpg",
		title : "Ein Stunde „Was mit Medien“",
		color : "#3080C4"
	},
	"eine-stunde-liebe" : {
		banner : "/images/podcasts/eine-stunde-liebe.jpg",
		title : "Ein Stunde Liebe",
		color : "#E63839"
	},
	"eine-stunde-history" : {
		banner : "/images/podcasts/eine-stunde-history.jpg",
		title : "Ein Stunde History",
		color : "#01061A"
	},
	"hielscher-oder-haase" : {
		banner : "/images/podcasts/hielscher-oder-haase.jpg",
		title : " Hielscher oder Haase",
		color : "#F5E013"
	},
	"early-bird" : {
		banner : "/images/podcasts/early-bird.jpg",
		title : "Early Bird",
		color : "#E1E344"
	},
	"dein-sonntag" : {
		banner : "/images/podcasts/dein-sonntag.jpg",
		title : "Dein Sonntag",
		color : "#D2E8F3"
	},
	"endlich-samstag" : {
		banner : "/images/podcasts/endlich_samstag.jpg",
		title : "Endlich Samstag",
		color : "#73BCB3"
	},
	
	"gruenstreifen" : {
		banner : "/images/podcasts/gruenstreifen.jpg",
		title : "Grünstreifen",
		color : "#39A156"
	}

};

module.exports = function() {
	var androidView = Ti.UI.createScrollView({
		layout : "vertical",
		scrollType : "vertical",
		height : "80%"
	});
	Object.getOwnPropertyNames(themen).forEach(function(thema) {
		androidView.add(Ti.UI.createImageView({
			image : themen[thema].banner,
			itemId : thema,
			top : 0,
			height : 'auto'
		}));
	});

	var $ = Ti.UI.createOptionDialog({
		opts : {
			title : "Thema"
		},
		androidView : androidView
	});
	androidView.addEventListener("click", function(e) {
		var thema = e.source.itemId;
		require("ui/nova/thema.window")(thema, themen[thema].title, themen[thema].color);
		$.hide();
	});
	$.show();

};