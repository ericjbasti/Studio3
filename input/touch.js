Studio.Stage.prototype.enableTouchEvents = function() {
	var me = this;

	// TYPES of EVENTS
	// finger also == mouse cursor
	// onTap : finger touch inside button
	// onTapOutside : finger touch anywhere besides button.
	// onDragStart : finger starts dragging a draggable button
	// onDragEnd : finger stops dragging a draggable button
	// // dragable is a state of a button... does not fire event while dragging.
	// onRelease : finger is released inside button
	// onReleaseOutside : finger in relased outside button
	// onHover : when over a button but not pressed. *mouse only?

	var mouse = { 
					x: 0, 
					y: 0, 
					dx: 0, 
					dy: 0, 
					id: 0
				}

	/* MOUSE EVENTS*/

	this.mouse_onDown = function(touch) {
		if (this.buttons && !this._pause_buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i]._touchID) {
					
					// already tapped by someone so lets leave it alone
				}else {
					if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
						this.buttons[i]._touchID = touch.id;
						if (this.buttons[i].onTap) this.buttons[i].onTap(touch); // cool we just clicked the button
						if (this.buttons[i].preventBubble) return;
					}else {
						if (this.buttons[i].onTapOutside) this.buttons[i].onTapOutside(touch);
					}
				}
			}
		}
	}

	this.mouse_onMove = function(touch) {
		if (this.buttons && !this._pause_buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
					if (this.buttons[i].draggable && touch.id) {
						if ((this.buttons[i]._touchID == touch.id)) {
							if (!this.buttons[i]._activeDrag) {
								if (this.buttons[i].onDragStart) this.buttons[i].onDragStart(touch); // we check to see if a drag has ever occured
								this.buttons[i]._activeDrag = true;
							}else {
								if (this.buttons[i].onDrag) {
									this.buttons[i].onDrag(touch);
								}
							}
						}
					}
					if (this.buttons[i].onHoverStart && !this.buttons[i].hovering) {
						this.buttons[i].onHoverStart(touch);
					}else if (this.buttons[i].onHover) {
						this.buttons[i].onHover(touch);
					}
					this.buttons[i].hovering = true;
				}else {
					if (this.buttons[i].hovering) {
						this.buttons[i].hovering = false;
						if (this.buttons[i].onHoverEnd) {
							this.buttons[i].onHoverEnd();
						}
					}
				}
				if ((this.buttons[i].draggable && this.buttons[i]._activeDrag) && (this.buttons[i]._touchID == touch.id)) {
					this.relativeX = touch.dx;
					this.relativeY = touch.dy;
					if (this.buttons[i].angle  && (this.buttons[i].orbits || this.buttons[i].inheritRotation)) {
						this.relativeX = (touch.dx * Math.cos(-this.buttons[i].angle)) - (touch.dy * Math.sin(-this.buttons[i].angle));
						this.relativeY = (touch.dx * Math.sin(-this.buttons[i].angle)) + (touch.dy * Math.cos(-this.buttons[i].angle));
						touch.dx = this.relativeX;
						touch.dy = this.relativeY;
					}
					if (this.buttons[i].onDrag) this.buttons[i].onDrag(touch);
				}
				if (this.buttons[i].onTouchMove) this.buttons[i].onTouchMove(touch);
			}
		}
	}

	this.mouse_onUp = function(touch) {
		if (this.buttons) {
			for (var i = 0; i != this.buttons.length; i++) {
				if (this.buttons[i]._touchID == touch.id) {
					
					if (this.buttons[i]._activeDrag) {
						if (this.buttons[i].onDragEnd) this.buttons[i].onDragEnd(touch); // we can end the drag if its active.
					}
					if (this.buttons[i].hitTestPoint(touch.x, touch.y)) {
						if (this.buttons[i].onRelease) this.buttons[i].onRelease(touch); // cool we just let go of the button
						
					}else {
						if (this.buttons[i].onReleaseOutside) this.buttons[i].onReleaseOutside(touch);
					}
					this.buttons[i]._activeDrag = false;
					this.buttons[i]._touchID = 0;
				}
			}
		}
	}
	var scaledMouse = {clientX: 0, clientY: 0}

	var ratioEvent = function(event) {
		scaledMouse.clientX = (event.clientX - me.canvas.offsetLeft) / me._scaleRatio;
		scaledMouse.clientY = (event.clientY - me.canvas.offsetTop) / me._scaleRatio;
		// return me.scaledMouse;
	}

	var mouse_down = function(event) {
		ratioEvent(event);
		mouse.id = 1;
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		mouse.dx = mouse.dy = 0;
		me.mouse_onDown(mouse);
	}
	var mouse_move = function(event) {
		ratioEvent(event);
		mouse.dx = mouse.x - (scaledMouse.clientX + me.camera.x);
		mouse.dy = mouse.y - (scaledMouse.clientY + me.camera.y);
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(mouse);
	}
	var mouse_release = function(event) {
		me.mouse_onUp(mouse);
		mouse.id = 0;
	}
	if (this._mouseWindow) {
		document.addEventListener("mousedown", mouse_down, false);
		document.addEventListener("mousemove", mouse_move, false);
		document.addEventListener("mouseup", mouse_release, false);
		document.addEventListener("mouseout", mouse_release, false);
	}else {
		this.canvas.addEventListener("mousedown", mouse_down, false);
		this.canvas.addEventListener("mousemove", mouse_move, false);
		this.canvas.addEventListener("mouseup", mouse_release, false);
		this.canvas.addEventListener("mouseout", mouse_release, false);
	}

	/* touch events
*/
	
	var touches = {}
	var touchID = 0;
	var events = [];
	var Event = {};
	var length = 0;

	var finger_press = function(event) {
	event.preventDefault();
	length =  event.targetTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.targetTouches[i].identifier;
		ratioEvent(event.targetTouches[i]);
		touches[touchID] = {};
		touches[touchID].id = touchID; // so we can allow multiple drags at once, without requiring a hit (for fast drags that cause the user to outrun the button)
		//touches[touchID].x = Event.clientX  + me.camera.x;
		//touches[touchID].y = Event.clientY  + me.camera.y;
		touches[touchID].x = scaledMouse.clientX + me.camera.x;
		touches[touchID].y = scaledMouse.clientY + me.camera.y;
		touches[touchID].dx = 0;
		touches[touchID].dy = 0;
		me.mouse_onDown(touches[touchID]);
	}
}
	var finger_move = function(event) {
	event.preventDefault();
	length =  event.targetTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.targetTouches[i].identifier;
		ratioEvent(event.targetTouches[i]);
		touches[touchID].dx = touches[touchID].x - scaledMouse.clientX;
		touches[touchID].dy = touches[touchID].y - scaledMouse.clientY;
		//touches[touchID].x = Event.clientX + me.camera.x;
		//touches[touchID].y = Event.clientY + me.camera.y;
		touches[touchID].x = scaledMouse.clientX + me.camera.x;
		touches[touchID].y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(touches[touchID]);
	}
}
	var finger_release = function(event) {
	event.preventDefault();
	length =  event.changedTouches.length
	for (var i = 0; i != length; i++) {
		touchID = event.changedTouches[i].identifier;
		me.mouse_onUp(touches[touchID]);
		delete touches[touchID];
	}

}

	if (!window.ejecta) {
		this.canvas.addEventListener("touchstart", finger_press, false);
		this.canvas.addEventListener("touchmove", finger_move, false);
		this.canvas.addEventListener("touchend", finger_release, false);
		this.canvas.addEventListener("touchcancel", finger_release, false);
		this.canvas.setAttribute('tabindex', '0');
		this.canvas.focus();
	}else {
		document.addEventListener("touchstart", finger_press, false);
		document.addEventListener("touchmove", finger_move, false);
		document.addEventListener("touchend", finger_release, false);
		document.addEventListener("touchcancel", finger_release, false);
	}
}

