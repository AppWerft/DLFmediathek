module.exports = function(_item, _color) {
    var self = Ti.UI.createTableViewRow({
        itemId : _item,
        height : Ti.UI.SIZE,

        backgroundColor : 'white'
    });
    self.add(Ti.UI.createImageView({
        opacity : 0.2,
        right : 3,
        top : 3,
        touchEnabled : false,
        image : '/images/menu.png',
        width : 15,
        height : 15
    }));
    self.add(Ti.UI.createLabel({
        left : 5,
        touchEnabled : false,
        top : 5,
        
        color : '#777',
        font : {
            fontSize : 24,
            fontWeight : 'bold',
            fontFamily : 'ScalaSansBold'
        },
        text : _item.datetime.split(' ')[1].substr(0, 5)
    }));
    var container = Ti.UI.createView({
        top : 5,
        height : Ti.UI.SIZE,
        touchEnabled : false,
        right : 40,
        left : 75,
        layout : 'vertical'
    });
    self.add(container);
    container.add(Ti.UI.createLabel({
        left : 0,
        top : 0,
        touchEnabled : false,
        text : _item.sendung.text,
        font : {
            fontSize : 20,
            fontFamily : 'DroidSansBold'
        },
        color : _color
    }));
    container.add(Ti.UI.createLabel({
        left : 0,
        top : 0,
        text : _item.title,
        touchEnabled : false,
        font : {
            fontSize : 16,
            fontFamily : 'ScalaSans'
        },
        color : '#333'
    }));
    if ( typeof _item.author == 'string')
        container.add(Ti.UI.createLabel({
            left : 0,
            top : 0,
            bottom : 10,
            height : Ti.UI.SIZE,
            text : 'Autor: ' + _item.author.split(', ')[1] + ' ' + _item.author.split(', ')[0],
            touchEnabled : false,
            font : {
                fontSize : 12,
                fontFamily : 'ScalaSans'
            },
            color : '#333'
        }));
    return self;
};
