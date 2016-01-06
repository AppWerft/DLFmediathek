var Chromecast = require('ti.chromecast');
var deviceManager = Chromecast.createDeviceManager({
    app: Chromecast.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID
});
deviceManager.addEventListener('deviceOnline', function (e) {
    var device = e.device;
    if (!deviceManager.isConnected()) {
        device.connect(function () {
            device.startApplication(function () {
                device.sendMessage({foo: 'bar'});
            });
        });
    }
});