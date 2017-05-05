var GAMEPAD = new Studio.Plugin({
	options: {
	},
	init: function GamePad_init(a) {
		this.gamepad = null;
		for(var i = 0; i<= 3; i++){ // we create the objects for gamepads even if we can't use them.
			a['GAMEPAD_'+i] = {active:false, AXES1:{X:0,Y:0}, AXES2:{X:0,Y:0}};
		}
		if(navigator.getGamepads){ // if we can use the Gamepads api, lets activate the plugin.
			this.gamepads = navigator.getGamepads();
			this.active = true;
		}
	},
	action: function(stage) {
		this.gamepads = navigator.getGamepads();
		var pad = null;
	    for(var i = 0; i != this.gamepads.length; i ++){
	        // If we actually have a gamepad connected at this index lets use it.
	        // its very possible to not have one at some point in the index.

	        if(this.gamepads[i]){ 
	        	if(!stage['GAMEPAD_'+i].active){
		    		stage['GAMEPAD_'+i].active = true;
		    		stage['GAMEPAD_'+i].id = this.gamepads[i].id;
		    		if(stage.gamepadconnected){
		    			stage.gamepadconnected(i,this.gamepads[i])
		    		}
		    	}
	        	// console.log(this.gamepads[i])
	            this.gamepad = this.gamepads[i];
	            pad = stage['GAMEPAD_'+(i+1)];

	            pad['A'] = this.gamepad.buttons[0].value; // A
	            pad['B'] = this.gamepad.buttons[1].value; // B
	            pad['X'] = this.gamepad.buttons[2].value; // X
	            pad['Y'] = this.gamepad.buttons[3].value; // Y

	            pad['L1'] = this.gamepad.buttons[4].value; // L1
	            pad['R1'] = this.gamepad.buttons[5].value; // R1
	            pad['L2'] = this.gamepad.buttons[6].value; // L2
	            pad['R2'] = this.gamepad.buttons[7].value; // R2

	            pad['UP'] = this.gamepad.buttons[12].value; // Up
	            pad['DOWN'] = this.gamepad.buttons[13].value; // Down
	            pad['LEFT'] = this.gamepad.buttons[14].value; // Left
	            pad['RIGHT'] = this.gamepad.buttons[15].value; // Right

	            pad['MENU'] = this.gamepad.buttons[9].value; // Menu

	            if(this.gamepad.axes){
	            	 pad['AXES1'].X = this.gamepad.axes[0];
	            	 pad['AXES1'].Y = this.gamepad.axes[1];
	            	 pad['AXES2'].X = this.gamepad.axes[2];
	            	 pad['AXES2'].Y = this.gamepad.axes[3];
	            }
	   		}else if(stage['GAMEPAD_'+i].active){
		    	stage['GAMEPAD_'+i].active = false;
		    	if(stage.gamepaddisconnected){
	    			stage.gamepaddisconnected(i,this.gamepads[i])
	    		}
		    }
	    }
	    // if(this.gamepads[0]){
	    // 	stage.keys['DOWN'] = this.gamepads[0].buttons[13].value;
	    // 	stage.keys['UP'] = this.gamepads[0].buttons[12].value;
	    // 	stage.keys['A'] = this.gamepads[0].buttons[0].value;
	    // 	stage.keys['B'] = this.gamepads[0].buttons[1].value;
	    // 	stage.keys['LEFT'] = this.gamepads[0].buttons[14].value;
	    // 	stage.keys['RIGHT'] = this.gamepads[0].buttons[15].value;
	    // }
	}
})