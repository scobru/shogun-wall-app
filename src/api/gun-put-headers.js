import Gun from 'gun'

(function() {
    Gun.on("opt", function (ctx) {
        if (ctx.once) {
            return;
        }
        ctx.on("out", function (msg) {
            var to = this.to;
            // Adds headers for put
            msg.headers = {
                token: "S3RVER",
            };
            //console.log('[PUT HEADERS]', msg)
            to.next(msg); // pass to next middleware
        });
    });
})(Gun);
