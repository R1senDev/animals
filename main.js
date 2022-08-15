let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

let cursor = {
	aim: {
		animated: false,
		frames: [new Image(20, 20)]
	},
};

cursor.aim.frames[0].src = 'cursors/aim/1.png';

let gamepadAPI = {
	controller: {},
	turbo: false,
	connect: function(event) {
		gamepadAPI.controller = event.gamepad;
		gamepadAPI.turbo = true;
		console.log('Gamepad connected!\n' + gamepadAPI.controller);
	},
	disconnect: function(event) {
		gamepadAPI.turbo = false;
		delete gamepadAPI.controller;
		console.log('Gamepad disconnected');
	},
	update: function() {
		// clear the buttons cache
		gamepadAPI.buttonsCache = [];
		// move the buttons status from the previous frame to the cache
		for (let k = 0; k < gamepadAPI.buttonsStatus.length; k++) {
			gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
		}
		// clear the buttons status
		gamepadAPI.buttonsStatus = [];
		// get the gamepad object
		let c = gamepadAPI.controller || {};
	
		// loop through buttons and push the pressed ones to the array
		let pressed = [];
		if(c.buttons) {
			for(let b = 0, t = c.buttons.length; b < t; b++) {
				if(c.buttons[b].pressed) {
					pressed.push(gamepadAPI.buttons[b]);
				}
			}
		}
		// loop through axes and push their values to the array
		let axes = [];
		if(c.axes) {
			for(let a = 0, x = c.axes.length; a < x; a++) {
				axes.push(c.axes[a].toFixed(2));
			}
		}
		// assign received values
		gamepadAPI.axesStatus = axes;
		gamepadAPI.buttonsStatus = pressed;
		// return buttons for debugging purposes
		return pressed;
	},
	buttonPressed: function(button, hold) {
		let newPress = false;
		// loop through pressed buttons
		for(let i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {
			// if we found the button we're looking for...
			if(gamepadAPI.buttonsStatus[i] == button) {
				// set the boolean letiable to true
				newPress = true;
				// if we want to check the single press
				if(!hold) {
					// loop through the cached states from the previous frame
					for(let j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {
						// if the button was already pressed, ignore new press
						if(gamepadAPI.buttonsCache[j] == button) {
							newPress = false;
						}
					}
				}
			}
		}
		return newPress;
	},
	buttons: ['DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', 'Start', 'Back', 'Axis-Left', 'Axis-Right','LB', 'RB', 'Power', 'A', 'B', 'X', 'Y'],
	buttonsCache: []
	buttonsStatus: [],
	axesStatus: []
};

window.addEventListener('gamepadconnected', gamepadAPI.connect);
window.addEventListener('gamepaddisconnected', gamepadAPI.disconnect);

let kbKeysPressed = new Map();

class Animal {
	constructor() {}
}