var instream = Ti.Stream.createStream({
    mode : Ti.Stream.MODE_READ,
    source : this.responseData
});
var outstream = f.open(Ti.Filesystem.MODE_WRITE);
var buffer = Ti.createBuffer({
    length : 1024
});
var read_bytes = 0;
while (( read_bytes = instream.read(buffer)) > 0) {
    outstream.write(buffer, 0, read_bytes);
}
instream.close();
outstream.close();
