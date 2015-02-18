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
                fontSize : 24,
                fontFamily : 'ScalaSansBold'
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
            left : 70,
            top : 5,
            right : 25
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                top : 5,
                font : {
                    fontSize : 22,
                    fontFamily : 'ScalaSansBold'
                },
                left : 0,
                width : Ti.UI.FILL,
            }

        }, {
            type : 'Ti.UI.WebView',
            bindId : 'equalizer',
            properties : {
                left : 0,
                top : 0,
                touchEnabled : false,
                borderRadius : 1,
                enableZoomControls : false,
                height : 0,
                width : 200
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'description',
            properties : {
                left : 0,
                top : 0,
                html : '',
                touchEnabled : false,
                font : {
                    fontSize : 16,
                    fontFamily : 'ScalaSans'
                },
                color : '#333'
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
            top : 0,
            touchEnabled : false,
            width : 90,
            height : 90
        }
    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 100,
            right : 20
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                top : 5,
                font : {
                    fontSize : 20,
                    fontFamily : 'ScalaSansBold'
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
                touchEnabled : false,
                font : {
                    fontSize : 16,
                    fontFamily : 'ScalaSans'
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
                    fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSansBold'
                },
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'author',
            properties : {
                left : 0,
                touchEnabled : false,
                top : 0,
                color : '#777',
                font : {
                    fontSize : 16,
                    fontFamily : 'ScalaSans'
                },
            }
        }]
    }]
};

exports.klangkunst = {
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
            touchEnabled : false,
            width : 120,
            height : 90
        }
    }, {
        type : 'Ti.UI.ImageView',
        bindId : 'alarm',
        properties : {
            left : 80,
            top : 90,
            opacity : 0.9,
            width : 40,
            height : 40
        }
    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 130,
            right : 20
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'subtitle',
            properties : {
                top : 5,
                font : {
                    fontSize : 20,
                    fontFamily : 'ScalaSansBold'
                },
                left : 0,
                height : Ti.UI.SIZE,
                width : Ti.UI.FILL,
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                top : 5,
                font : {
                    fontSize : 20,
                    fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSans'
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
                    fontFamily : 'ScalaSansBold'
                },
            }
        }]
    }]
};

/************/
exports.podcast = {
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
                fontSize : 24,
                fontFamily : 'ScalaSansBold'
            },
        }
    }, {
        type : 'Ti.UI.ImageView',
        bindId : 'fav',
        properties : {
            opacity : 0.5,
            left : 10,
            top : 32,
            bubbleParent : true,
            image : '/images/favadd.png',
            width : 32,
            height : 32
        }
    }, {
        type : 'Ti.UI.View',
        bindId : 'playtrigger',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 70,
            right : 25
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                color : '#060',
                top : 5,
                font : {
                    fontSize : 20,
                    fontFamily : 'ScalaSansBold'
                },
                left : 0,
                width : Ti.UI.FILL,
            }

        }, {
            type : 'Ti.UI.Label',
            bindId : 'subtitle',
            properties : {
                left : 0,
                top : 0,
                touchEnabled : false,
                font : {
                    fontSize : 16,
                    fontFamily : 'ScalaSans'
                },
                color : '#333'
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'autor',
            properties : {
                left : 0,
                top : 0,
                bottom : 10,
                height : Ti.UI.SIZE,
                touchEnabled : false,
                font : {
                    fontSize : 12,
                    fontFamily : 'ScalaSans'
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
                fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSansBold'
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
                    fontSize : 18,
                    fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSans'
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
                    fontFamily : 'ScalaSans'
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
                fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSans'
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
    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 100,
            right : 25
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                color : '#555',
                top : 5,
                font : {
                    fontSize : 22,
                    fontFamily : 'ScalaSansBold'
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
                    fontFamily : 'ScalaSans'
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
                bottom : 10,
                color : '#777',
                font : {
                    fontSize : 14,
                    fontFamily : 'ScalaSans'
                },
            }
        }]
    }]
};
