var Foo = function() {
    return this;
};
Foo.prototype = {
    log : function() {
        console.log('test');
    }
};
exports.createFoo = function() {
    return new Foo();
};