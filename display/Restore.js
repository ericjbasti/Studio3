Studio.Restore = function() {
};

Studio.Restore.prototype = new Studio.Rect();
Studio.Restore.prototype.constructor = Studio.Restore;

Studio.Restore.prototype.draw = function(ctx) {
	ctx.restore();
};