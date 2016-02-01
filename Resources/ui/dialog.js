module.exports = function(item) {
    
    var self = Ti.UI.createAlertDialog({
        message : item.title,
        ok : 'Beitrag anhören',
        androidView : view,
        title : item.sendung.text
    });
    self.show();
    self.addEventListener('click',function(){
       Ti.App.fireEvent('app:play',item); 
    });
    console.log(item);

};
