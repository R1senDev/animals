let cursor = {
	aim: {
		animated: false,
		frames: [new Image(20, 20)]
	},
};

cursor.aim.frames[0].src = 'cursors/aim/1.png';

let gamepadAPI = {
	controller: {},
	connected: false,
	connect: function(event) {
		gamepadAPI.controller = event.gamepad;
		gamepadAPI.connected = true;
		console.log('Gamepad connected!\n' + gamepadAPI.controller);
	},
	disconnect: function(event) {
		gamepadAPI.connected = false;
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
	buttonsCache: [],
	buttonsStatus: [],
	axesStatus: []
};

window.addEventListener('gamepadconnected', gamepadAPI.connect);
window.addEventListener('gamepaddisconnected', gamepadAPI.disconnect);

let kbKeysPressed = new Map();

let map = [['deepWater', 'water', 'shoreWater', 'sand', 'sand', 'grass']];

class Animal {
	constructor(x, y, type) {
		this.type = type;
		switch (type) {
			case 'wolf':
				this.hp = 100;
				this.damage = 25;
				this.size = {width: 2, height: 2};
				this.color = '#4d4d4d';
				// Used to define relationships with other animals
				this.strength = 50;
				this.speed = {
					wandering: 1,
					running: 2,
				};
				this.fov = 20;
				this.surfaces = {
					land: true,
					water: false
				};
				this.flies = false;
				this.predator = true;
				break;

			case 'sheep':
				this.hp = 100;
				this.damage = 0;
				this.size = {width: 2, height: 2};
				this.color = '#ffffff';
				// Used to define relationships with other animals
				this.strength = 10;
				this.speed = {
					wandering: 1,
					running: 1.5,
				};
				this.fov = 15;
				this.surfaces = {
					land: true,
					water: false
				};
				this.flies = false;
				this.predator = false;
				break;

			case 'lion':
				this.hp = 150;
				this.damage = 35;
				this.size = {width: 2, height: 2};
				this.color = '#995400';
				// Used to define relationships with other animals
				this.strength = 60;
				this.speed = {
					wandering: 1,
					running: 2.5,
				};
				this.fov = 20;
				this.surfaces = {
					land: true,
					water: false
				};
				this.flies = false;
				this.predator = true;
				break;
		}
	}
}

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
}

function tick() {

}

let pixelSize = 50;

function draw() {
	noStroke();
	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
			console.log(`Reading map[${x}][${y}]`);
			switch (map[x][y]) {
				case 'sand':
					fill(color('#fcdd76'));
					break;
				case 'grass':
					fill(color('#5da130'));
					break;
				case 'deepWater':
					fill(color('#0046b8'));
					break;
				case 'water':
					fill(color('#1f75fe'));
					break;
				case 'shoreWater':
					fill(color('#5294ff'));
					break;
			}
			rect(y * pixelSize, x * pixelSize, pixelSize, pixelSize);
		}
	}
}