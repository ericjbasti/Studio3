// This enables accelometer informtion.
// Since this is a device level thing, we store the info in the Studio obj.
// this allows multiple stages to access the data while only checking for 
// the events once.

// Studio.enableTiltEvents= function(){
	Studio.accel={
		x : 0,
		y : 0,
		z : 0
	};
	Studio.rotationRate={
		alpha : 0,
		beta : 0,
		gamma : 0
	};
	window.ondevicemotion = function(e){
		Studio.accel.x += ( e.accelerationIncludingGravity.x - Studio.accel.x ) / 20;
		Studio.accel.y += ( e.accelerationIncludingGravity.y - Studio.accel.y ) / 20;
		Studio.accel.z += ( e.accelerationIncludingGravity.z - Studio.accel.z ) / 20;
		Studio.rotationRate.alpha += ( e.rotationRate.alpha - Studio.rotationRate.alpha ) / 20;
		Studio.rotationRate.beta  += ( e.rotationRate.beta - Studio.rotationRate.beta ) / 20;
		Studio.rotationRate.gamma += ( e.rotationRate.gamma - Studio.rotationRate.gamma )/ 20;
	}
// }