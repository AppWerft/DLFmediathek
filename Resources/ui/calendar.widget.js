module.exports = function(args) {
    var parent = args.self,
        color = args.color;

    var self = Ti.UI.createView({
        width : 200,
        right : -200,
        opacity : 0.9,
        top : 0,
        height : 40,
        color : 'white',
        text : 'Heute',
        zIndex : 999,
        transform : Ti.UI.create2DMatrix({
            rotate : 90,
            anchorPoint : {
                x : 0,
                y : 0
            }
        }),
        backgroundColor : color,
        font : {
            fontSize : 20,
            fontFamily : 'ScalaSansBold'
        },
    });
    self.add(Ti.UI.createLabel({
        text : 'Heute',
        left : 15,
        width : Ti.UI.FILL,
        color : 'white',
        touchEnabled : false,
        font : {
            fontSize : 22,
            fontFamily : 'ScalaSansBold'
        },
    }));
    self.addEventListener('click', function(_e) {
        var picker = Ti.UI.createPicker({
            type : Ti.UI.PICKER_TYPE_DATE,
            minDate : new Date(2009, 0, 1),
            maxDate : Moment().toDate(),
            value : parent.date.toDate(),
            locale : 'de'
        });
        picker.showDatePickerDialog({
            value : parent.date.toDate(),
            callback : function(e) {
                if (!e.cancel) {
                    parent.date = Moment(e.value).startOf('day');
                    self.children[0].setText(Moment(parent.date).format('LL'));
                    self.updatePodcasts();
                }
            }
        });
    });
    self.addEventListener('swipe', function(_e) {
        if (_e.direction == 'left') {// back in time
            parent.date = parent.date.add(-1, 'd');
            parent.hideCurrent();
        }
        if (_e.direction == 'right') {// forward in time
            if (parent.date.isBefore(Moment().startOf('day'))) {
                parent.date = parent.date.add(1, 'd');
            }
        }
        _e.source.children[0].setText(Moment(parent.date).format('LL'));
        parent.updatePodcasts();
    });
    return self;
};
