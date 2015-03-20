var service = Titanium.Android.currentService;

var id = service.serviceInstanceId;
var intent = service.intent;
var message = intent.getStringExtra("url");
Titanium.API.info("Hello World!  I am a Service.  I have this to say: " + message + '    '+ id);