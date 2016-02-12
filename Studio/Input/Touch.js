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

	this.mouse_onDown = function(touch, scene) {
		if (scene.buttons && !scene._pause_buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i]._touchID) {
					// already tapped by someone so lets leave it alone
				} else {
					if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
						scene.buttons[i]._touchID = touch.id;
						if (scene.buttons[i].onTap) {
							scene.buttons[i].onTap(touch); // cool we just clicked the button
						}
						if (scene.buttons[i].preventBubble) {
							return;
						}
					} else {
						if (scene.buttons[i].onTapOutside) {
							scene.buttons[i].onTapOutside(touch);
						}
					}
				}
			}
		}
	}

	this.mouse_onMove = function(touch, scene) {
		if (scene.buttons && !scene._pause_buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
					if (scene.buttons[i].draggable && touch.id) {
						if ((scene.buttons[i]._touchID == touch.id)) {
							if (!scene.buttons[i]._activeDrag) {
								if (scene.buttons[i].onDragStart) {
									scene.buttons[i].onDragStart(touch); // we check to see if a drag has ever occured
								}
								scene.buttons[i]._activeDrag = true;
							} else {
								if (scene.buttons[i].onDrag) {
									scene.buttons[i].onDrag(touch);
								}
							}
						}
					}
					if (scene.buttons[i].onHoverStart && !scene.buttons[i].hovering) {
						scene.buttons[i].onHoverStart(touch);
					} else if (scene.buttons[i].onHover) {
						scene.buttons[i].onHover(touch);
					}
					scene.buttons[i].hovering = true;
				} else {
					if (scene.buttons[i].hovering) {
						scene.buttons[i].hovering = false;
						if (scene.buttons[i].onHoverEnd) {
							scene.buttons[i].onHoverEnd();
						}
					}
				}
				if ((scene.buttons[i].draggable && scene.buttons[i]._activeDrag) && (scene.buttons[i]._touchID == touch.id)) {
					scene.relativeX = touch.dx;
					scene.relativeY = touch.dy;
					if (scene.buttons[i].angle  && (scene.buttons[i].orbits || scene.buttons[i].inheritRotation)) {
						scene.relativeX = (touch.dx * Math.cos(-scene.buttons[i].angle)) - (touch.dy * Math.sin(-scene.buttons[i].angle));
						scene.relativeY = (touch.dx * Math.sin(-scene.buttons[i].angle)) + (touch.dy * Math.cos(-scene.buttons[i].angle));
						touch.dx = scene.relativeX;
						touch.dy = scene.relativeY;
					}
					if (scene.buttons[i].onDrag) {
						scene.buttons[i].onDrag(touch);
					}
				}
				if (scene.buttons[i].onTouchMove) {
					scene.buttons[i].onTouchMove(touch);
				}
			}
		}
	}

	this.mouse_onUp = function(touch, scene) {
		if (scene.buttons) {
			for (var i = 0; i != scene.buttons.length; i++) {
				if (scene.buttons[i]._touchID == touch.id) {
					
					if (scene.buttons[i]._activeDrag) {
						if (scene.buttons[i].onDragEnd) {
							scene.buttons[i].onDragEnd(touch); // we can end the drag if its active.
						}
					}
					if (scene.buttons[i].hitTestPoint(touch.x, touch.y)) {
						if (scene.buttons[i].onRelease) {
							scene.buttons[i].onRelease(touch); // cool we just let go of the button
						}
					} else {
						if (scene.buttons[i].onReleaseOutside) {
							scene.buttons[i].onReleaseOutside(touch);
						}
					}
					scene.buttons[i]._activeDrag = false;
					scene.buttons[i]._touchID = 0;
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
		me.mouse_onDown(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onDown(mouse, me.activeScene);
			}
		}
	}
	var mouse_move = function(event) {
		ratioEvent(event);
		mouse.dx = mouse.x - (scaledMouse.clientX + me.camera.x);
		mouse.dy = mouse.y - (scaledMouse.clientY + me.camera.y);
		mouse.x = scaledMouse.clientX + me.camera.x;
		mouse.y = scaledMouse.clientY + me.camera.y;
		me.mouse_onMove(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onMove(mouse, me.activeScene);
			}
		}

	}
	var mouse_release = function(event) {
		me.mouse_onUp(mouse, me);
		if(me.activeScene){
			if(me.activeScene.active){
				me.mouse_onUp(mouse, me.activeScene);
			}
		}
		mouse.id = 0;
	}
	if (this._mouseWindow) {
		document.addEventListener("mousedown", mouse_down, false);
		document.addEventListener("mousemove", mouse_move, false);
		document.addEventListener("mouseup", mouse_release, false);
		document.addEventListener("mouseout", mouse_release, false);
	} else {
		this.canvas.addEventListener("mousedown", mouse_down, false);
		this.canvas.addEventListener("mousemove", mouse_move, false);
		this.canvas.addEventListener("mouseup", mouse_release, false);
		this.canvas.addEventListener("mouseout", mouse_release, false);
	}

	/* touch events*/
	
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
			touches[touchID].x = scaledMouse.clientX + me.camera.x;
			touches[touchID].y = scaledMouse.clientY + me.camera.y;
			touches[touchID].dx = 0;
			touches[touchID].dy = 0;
			me.mouse_onDown(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onDown(touches[touchID], me.activeScene);
				}
			}
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
			touches[touchID].x = scaledMouse.clientX + me.camera.x;
			touches[touchID].y = scaledMouse.clientY + me.camera.y;
			me.mouse_onMove(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onMove(touches[touchID], me.activeScene);
				}
			}
		}
	}
	
	var finger_release = function(event) {
		event.preventDefault();
		length =  event.changedTouches.length
		for (var i = 0; i != length; i++) {
			touchID = event.changedTouches[i].identifier;
			me.mouse_onUp(touches[touchID], me);
			if(me.activeScene){
				if(me.activeScene.active){
					me.mouse_onUp(touches[touchID], me.activeScene);
				}
			}
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
	} else {
		document.addEventListener("touchstart", finger_press, false);
		document.addEventListener("touchmove", finger_move, false);
		document.addEventListener("touchend", finger_release, false);
		document.addEventListener("touchcancel", finger_release, false);
	}
}

