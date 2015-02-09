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
            visible : false,
            image : '/images/menu.png',
            width : 15,
            height : 15
        }
    }, {
        type : 'Ti.UI.View',
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
                    fontSize : 22,
                    fontWeight : 'bold',
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

