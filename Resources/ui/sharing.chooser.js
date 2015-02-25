
/* Thanks to Stefan G.  ;-)) */
var myAccounts = require('org.bcbhh').getAccounts();

console.log(myAccounts);
function hasAccount(_accounttype) {
    for (var i = 0; i < myAccounts.length; i++) {
        if (myAccounts[i].accountType == _accounttype)
            return true;
    }
    return false;
}

module.exports = function(_cb) {
    var items = [{
        label : 'Twitter',
        icon : '/images/twitter.png'
    }, {
        label : 'Facebook',
        icon : '/images/facebook.png',
    }, {
        label : 'Google',
        icon : '/images/google.png',
    }, {
        label : 'XING',
        icon : '/images/xing.png',
    }, /*{
        label : 'Meetup',
        icon : '/images/meetup.png',
    }, {
        label : 'Dropbox',
        icon : '/images/dropbox.png',
    }*/, {
        label : 'Download',
        icon : '/images/download.png',
    }];

    var rows = [];
    items.forEach(function(item) {
        if (hasAccount(item.label) || item.label=='Download') {
            var row = Ti.UI.createTableViewRow({
                itemId : item.label
            });
            row.add(Ti.UI.createImageView({
                image : item.icon,
                left : 5,
                top : 5,
                bottom : 5,
                width : 40,
                height : 40
            }));
            row.add(Ti.UI.createLabel({
                text : item.label,
                left : 80,
                font : {
                    fontFamily : 'DroidSans',
                    fontSize : 20
                }
            }));
            rows.push(row);
        }
    });
    var androidview = Ti.UI.createTableView({
        data : rows
    });
    androidview.addEventListener('click', function(_e) {
        _cb(_e.rowData.itemId);
        dialog.hide();
    });
    var dialog = Ti.UI.createOptionDialog({
        androidView : androidview,
        title : 'Teilen'
    });
    dialog.show();
};
