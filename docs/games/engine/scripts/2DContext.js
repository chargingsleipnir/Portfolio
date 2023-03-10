
var TwoD = {
    ctx: null,
    Initialize: function(context2D) {
        /// <signature>
        ///  <summary>Initialize 2D by establisking context</summary>
        ///  <param name="context2D" type="context">the 2D context call from the canvas element</param>
        /// </signature>
        this.ctx = context2D;
    },
    GetCanvas: function() {
        return this.ctx.canvas;
    },
    SetStyles: function(fontSize) {
        this.ctx.font = fontSize + "px monospace";
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
    },
    GetTextWidth: function(msg) {
        return this.ctx.measureText(msg).width;
    },
    DrawText: function(msg, x, y) {
        this.ctx.fillText(msg, x, y);
    }
};