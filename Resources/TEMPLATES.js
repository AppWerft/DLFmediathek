exports.podcast = {
    properties : {
        height : Ti.UI.SIZE
    },
    childTemplates : [{
        type : 'Ti.UI.Label',
        bindId : start,
        properties : {
            left : 5,
            touchEnabled : false,
            top : 5,
            color : '#777',
            font : {
                fontSize : 24,
                fontWeight : 'bold',
                fontFamily : 'ScalaSansBold'
            },
        }
    }, {
        type : 'Ti.UI.ImageView',
        properties : {
            opacity : 0.2,
            right : 3,
            top : 3,
            touchEnabled : false,
            image : '/images/menu.png',
            width : 15,
            height : 15
        }
    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                color : '#060',
                font : {
                    fontSize : 22,
                    fontWeight : 'bold',
                    fontFamily : 'TheSans-B7Bold'
                },
                left : Ti.UI.CONF.padding,
                width : Ti.UI.FILL,
            },
            events : {}
        }, {
            type : 'Ti.UI.Label',
            bindId : 'subtitle',
            properties : {}
        }, {
            type : 'Ti.UI.Label',
            bindId : 'autor',
            properties : {}
        }]
    }]
};

