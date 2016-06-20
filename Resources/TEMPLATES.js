var cacheIcon = {
	type : 'Ti.UI.ImageView',
	bindId : 'cached',
	properties : {
		left : 5,
		touchEnabled : false,
		top : 10,
		width : 30,
		touchEnabled : false,
		image : '/images/offline.png',
		height : 30
	}
};

var Cache = require('controls/cache.adapter');

var TITLESIZE = 22;

exports.schema = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.Label',
		bindId : 'start',
		properties : {
			left : 5,
			touchEnabled : false,
			top : 5,
			color : '#777',
			font : {
				fontSize : 22,

				fontFamily : 'Aller'
			},
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'onair',
		properties : {
			left : 10,
			top : 40,
			bottom : 10,
			touchEnabled : true,
			visible : false,
			image : '/images/play.png',
			width : 40,
			height : 40
		}
	}, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 80,
			top : 0,
			height : Ti.UI.SIZE,
			right : 15
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				top : 5,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'description',
			properties : {
				left : 0,
				top : 0,
				html : '',
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'duration',
			properties : {
				left : 0,
				top : 0,
				bottom : 5,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
				color : '#888'
			}
		}]
	}]
};
exports.podcastlist = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'image',
		properties : {
			left : 0,
			top : 5,
			touchEnabled : true,
			width : 90,
			height : 90
		}
	}, cacheIcon, {
		type : 'Ti.UI.Label',
		bindId : 'copyright',
		properties : {
			visible : false,
			touchEnabled : false,
		}
	}, {
		type : 'Ti.UI.View',
		bindId : 'playstarter',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 100,
			bottom : 10,
			right : 20
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				top : 5,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'description',
			properties : {
				left : 0,
				top : 0,
				text : '',
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'pubdate',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 0,
				color : '#777',
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'duration',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 0,
				color : '#777',
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'author',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 5,
				color : '#777',
				font : {
					fontSize : 14,
					fontFamily : 'Aller'
				},
			}
		}]
	}]
};



/************/
exports.mediathek = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.Label',
		bindId : 'start',
		properties : {
			left : 5,
			touchEnabled : false,
			top : 2,
			color : '#555',
			font : {
				fontSize : 22,
				fontFamily : 'Aller'
			},
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'fav',
		properties : {
			opacity : 0.5,
			left : 5,
			top : 32,
			bottom : 5,
			bubbleParent : true,
			image : '/images/favadd.png',
			width : 30,
			height : 30
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'share',
		properties : {
			opacity : 0.5,
			left : 35,
			top : 35,
			bottom : 5,
			bubbleParent : true,
			image : '/images/share.png',
			width : 27,
			height : 27
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'cache',
		properties : {
			opacity : 0.5,
			left : 5,
			bottom : 5,
			bubbleParent : true,
			image : '/images/cloud.png',
			width : 27,
			height : 27
		}
	}, {
		type : 'Ti.UI.View',
		bindId : 'playtrigger',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 75,
			right : 25
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'subtitle',
			properties : {
				left : 0,
				top : 5,
				touchEnabled : false,
				font : {
					fontSize : 20,
					fontFamily : 'Aller Bold'
				},
				color : '#555'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'autor',
			properties : {
				left : 0,
				top : 5,

				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'depub',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'duration',
			properties : {
				left : 0,
				top : 5,
				bottom : 5,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 18,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}]
	}]
};

exports.merkliste = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'logo',
		properties : {
			opacity : 1,
			left : 0,
			top : 0,
			bubbleParent : true,
			image : '',
			width : 60,
			height : 60
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'trash',
		properties : {
			opacity : 0.4,
			left : 0,
			top : 65,
			bubbleParent : true,
			image : '',
			width : 50,
			height : 50
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'duration',
		properties : {
			color : '#555',
			top : 115,
			bottom : 5,
			font : {
				fontSize : 16,
				fontFamily : 'Aller'
			},
			left : 5,
			textAlign : 'left',
			width : Ti.UI.FILL,
		}

	}, {
		type : 'Ti.UI.View',
		bindId : 'trashcontainer',
		properties : {
			top : 0,
			left : 0,
			width : 70,
		}

	}, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 70,
			right : 5,
			top : 0
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'subtitle',
			properties : {
				color : '#060',
				top : 5,
				font : {
					fontSize : 22,
					fontFamily : 'Aller'
				},
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				color : '#555'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'autor',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'pubdate',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 0,
				color : '#777',
				font : {
					fontSize : 14,
					fontFamily : 'Aller'
				},
			}
		}]
	}]
};

exports.merklisteactive = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : '#444',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'logo',
		properties : {
			opacity : 1,
			left : 0,
			top : 0,
			bubbleParent : true,
			image : '',
			width : 60,
			height : 60
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'trash',
		properties : {
			opacity : 0.4,
			left : 0,
			top : 0,
			bubbleParent : true,
			image : '',
			width : 0,
			height : 0
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'duration',
		properties : {
			color : '#aaa',
			top : 65,
			bottom : 5,
			font : {
				fontSize : 18,
				fontFamily : 'Aller'
			},
			left : 5,
			textAlign : 'left',
			width : Ti.UI.FILL,
		}

	}, {
		type : 'Ti.UI.View',
		bindId : 'trashcontainer',
		properties : {
			top : 0,
			left : 0,
			width : 70,
		}

	}, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 70,
			right : 5,
			top : 0
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'subtitle',
			properties : {
				color : '#060',
				top : 5,
				font : {
					fontSize : 22,
					fontFamily : 'Aller'
				},
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				left : 0,
				top : 0,
				height : 0,
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'autor',
			properties : {
				left : 0,
				top : 0,
				height : 0,
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'pubdate',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 0,
				color : '#eee',
				font : {
					fontSize : 14,
					fontFamily : 'Aller'
				},
			}
		}]
	}]
};

exports.mypodcasts = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
		itemId : ''
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'logo',
		properties : {
			left : 0,
			top : 5,
			bubbleParent : true,
			image : '',
			width : 90,
			height : 90
		}
	}, cacheIcon, {
		type : 'Ti.UI.View',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 100,
			right : 25,
			bottom : 10
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				color : '#555',
				top : 5,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				left : 0,
				width : Ti.UI.FILL,
			}

		}, {
			type : 'Ti.UI.Label',
			bindId : 'description',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Aller'
				},
				color : '#555'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'lastbuilddate',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 5,
				color : '#777',
				font : {
					fontSize : 14,
					fontFamily : 'Aller'
				},
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'total',
			properties : {
				left : 0,
				touchEnabled : false,
				top : 2,
				color : '#777',
				font : {
					fontSize : 14,
					fontFamily : 'Aller'
				},
			}
		}]
	}]
};

exports.search = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'image',
		properties : {
			left : 0,
			touchEnabled : false,
			top : 0,
			width : 70,
			height : 70
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'fav',
		properties : {
			opacity : 0.5,
			left : 5,
			top : 32,
			visible : false,
			bottom : 5,
			bubbleParent : true,
			image : '/images/favadd.png',
			width : 30,
			height : 30
		}
	}, {
		type : 'Ti.UI.ImageView',
		bindId : 'share',
		properties : {
			opacity : 0.5,
			left : 35,
			top : 35,
			visible : false,
			bottom : 5,
			bubbleParent : true,
			image : '/images/share.png',
			width : 27,
			height : 27
		}
	}, {
		type : 'Ti.UI.View',
		bindId : 'playtrigger',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 85,
			top : 0,
			right : 15,
			bottom : 10
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				left : 0,
				top : 5,
				height : 50,
				verticalAlign : 'vertical',
				touchEnabled : false,
				ellipsize : Ti.UI.TEXT_ELLIPSIZE_TRUNCATE_END,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'author',
			properties : {
				left : 0,
				top : 10,
				height : 15,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'duration',
			properties : {
				left : 0,
				top : 0,
				height : 15,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'pubdate',
			properties : {
				left : 0,
				top : 0,
				height : 15,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'sendung',
			properties : {
				left : 0,
				top : 0,
				height : 22,
				touchEnabled : false,
				font : {
					fontSize : 18,
					fontFamily : 'Aller Bold'
				},
				color : '#333'
			}
		}]
	}]
};

exports.recents = {
	properties : {
		height : Ti.UI.SIZE,
		backgroundColor : 'white',
	},
	events : {
		"longpress" : function(event) {
			var item = event.section.getItemAt(event.itemIndex);
			event.section.deleteItemsAt(event.itemIndex, 1);
			Cache.deleteURL({
				url : JSON.parse(event.itemId).url,
				station : JSON.parse(event.itemId).station
			});
			var Recents = new (require('controls/recents.adapter'))();
			Recents.removeRecent(JSON.parse(event.itemId).url);
		}
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'image',
		properties : {
			left : 0,
			touchEnabled : false,
			top : 0,
			width : 70,
			height : 70
		}
	}, cacheIcon, {
		type : 'Ti.UI.View',
		bindId : 'playtrigger',
		properties : {
			width : Ti.UI.FILL,
			layout : 'vertical',
			left : 85,
			top : 0,
			right : 15,
			bottom : 10
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				left : 0,
				top : 5,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : TITLESIZE,
					fontFamily : 'Aller Bold'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'author',
			properties : {
				left : 0,
				top : 10,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'duration',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'pubdate',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'lastaccess',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'progress',
			properties : {
				left : 0,
				top : 0,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 12,
					fontFamily : 'Aller'
				},
				color : '#333'
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'sendung',
			properties : {
				left : 0,
				top : 5,
				height : Ti.UI.SIZE,
				touchEnabled : false,
				font : {
					fontSize : 16,
					fontFamily : 'Aller Bold'
				},
				color : '#555'
			}
		}]
	}]
};

var w = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;

exports.tilestemplate = {
	properties : {
		layout : 'horizontal',
		height : Ti.UI.SIZE,
	},
	childTemplates : [{
		type : 'Ti.UI.View',
		bindId : 'i1',
		properties : {
			left : 0,
			top : 0,
			width : '50%',
			height : w / 2
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'label1',
			properties : {
				top : '50%',
				left : 10,
				color : '#222',
				touchEnabled : false,
				right : 5,
				font : {
					fontSize : 24,
					fontFamily : 'ScalaSans'
				}
			}
		}]
	}, {
		type : 'Ti.UI.View',
		bindId : 'i2',
		properties : {
			left : 0,
			top : 0,
			width : '50%',
			height : w / 2
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'label2',
			properties : {
				top : '50%',
				left : 10,
				color : '#222',
				touchEnabled : false,
				right : 5,
				font : {
					fontSize : 22,
					fontFamily : 'ScalaSans'
				}
			}
		}]
	}]
};

exports.earlybird = {
	properties : {

		height : Ti.UI.SIZE,
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'image',
		properties : {
			touchEnabled : false,
			top : 0,
			width : Ti.UI.FILL,
			height : 'auto',
			defaultImage : '/images/earlybird.jpg'
		}
	}, {
		type : 'Ti.UI.View',
		properties : {
			bottom : 0,
			height : 55,
			backgroundColor : '#8801953C',
			touchEnabled : false,
		}
	}, {
		type : 'Ti.UI.Label',
		bindId : 'description',
		properties : {
			bottom : 5,
			right : 10,
			left : 10,
			color : '#fff',
			touchEnabled : false,
			right : 5,
			font : {
				fontSize : 18,
				fontFamily : 'Aller Bold'
			}
		}
	}]
};

