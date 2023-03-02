let kbKeysPressed = new Map();

let map = [[]];

let dev = {
	lines: true,
	fpsLimit: 30,
};

let pixelSize = 5;
let mapSize = [100, 100];

let generatorProperties = {
	islandsCount: 3,
	// This is not the actual size of the island, but a side
	// setting of the generator, only indirectly affecting its
	// size. Setting a value of 100 corresponds to a strict
	// (minimumWaterPercent * 100)% of water and
	// (100 - minimumWaterPercent * 100)% of land, but a
	// value of 99 does not guarantee that the island
	// consist of two or three cells (albeit with a small
	// probability).
	islandSize: 98,
	minimumWaterPercent: 0.25,
	sandLayers: 2,
};

let simulation = {
	eatingDistance: 2,
};

function generateWorld(type) {
	map = [];
	switch (type) {
		case 'classic':
			// Cleaning map
			for (let e = 0; e < mapSize[1]; e++) {
				map.push([]);
			}

			// Creating ocean
			for (let y = 0; y < mapSize[1]; y++) {
				for (let x = 0; x < mapSize[0]; x++) {
					map[x][y] = 'deepWater';
				}
			}

			// Planting island
			for (let i = 0; i < generatorProperties.islandsCount; i++) {
				let rPos = [Math.floor(Math.random() * mapSize[0]), Math.floor(Math.random() * mapSize[1])];
				map[rPos[0]][rPos[1]] = 'grass';
			}

			let rSpr = 0;
			let spawnPos = 0;

			// Growing island up
			while (rSpr < generatorProperties.islandSize) {
				for (let y = 0; y < mapSize[1]; y++) {
					for (let x = 0; x < mapSize[0]; x++) {
						if (map[x][y] == 'grass') {
							spawnPos = Math.floor(Math.random() * 4);
							switch (spawnPos) {
								case 0:
									try {
										map[x][y - 1] = 'grass';
									} catch {}
									break;
								case 1:
									try {
										map[x + 1][y] = 'grass';
									} catch {}
									break;
								case 2:
									try {
										map[x][y + 1] = 'grass';
									} catch {}
									break;
								case 3:
									try {
										map[x - 1][y] = 'grass';
									} catch {}
									break;
							}
						}
					}
				}

				// [water, land]
				let tilesCount = [0, 0];
				for (let y = 0; y < mapSize[1]; y++) {
					for (let x = 0; x < mapSize[0]; x++) {
						if (map[x][y] == 'grass') {
							tilesCount[1] += 1;
						} else {
							tilesCount[0] += 1;
						}
					}
				}
				if (tilesCount[0] / tilesCount[1] <= generatorProperties.minimumWaterPercent) {
					break;
				}

				rSpr = Math.random() * 101;
			}

			// Sand generation
			for (let y = 0; y < mapSize[1]; y++) {
				for (let x = 0; x < mapSize[0]; x++) {
					try {
						if ((map[x][y] == 'grass' || map[x][y] == 'sand') && (map[x][y - 1] == 'deepWater' || map[x + 1][y] == 'deepWater' || map[x][y + 1] == 'deepWater' || map[x - 1][y] == 'deepWater')) {
							map[x][y] = 'sand';
						}
					} catch {}
				}
			}

			for (let sl = 0; sl < generatorProperties.sandLayers - 1; sl++) {
				for (let y = 0; y < mapSize[1]; y++) {
					for (let x = 0; x < mapSize[0]; x++) {
						if (map[x][y] == 'sand') {
							for (let y1 = y - 1; y1 < y + 1; y1++) {
								try {
									for (let x1 = x - 1; x1 < x + 1; x1++) {
										if (map[x1][y1] == 'grass') {
											map[x1][y1] = 'sand';
										}
									}
								} catch {}
							}
						}
					}
				}
			}

			// Cropping
			for (let y = 0; y < mapSize[1]; y++) {
				map[y] = map[y].slice(0, mapSize[0]);
			}

			break;

		case 'debug':
			map = [
				['deepWater', 'water', 'shoreWater', 'sand', 'grass', 'fire'],
				['coal1', 'coal2', 'coal3'],
			];
			break;
	}
}

let nextID = 0;

let __Animal__ = null;
function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	generateWorld('classic');

	__Animal__ = class Animal {
		constructor(x, y, type, special={
			tracking: false,
		}) {
			this.ID = nextID;
			nextID++;
			this.pos = createVector(x, y);
			this.type = type;
			this.special = special;
			switch (type) {
				case 'wolf':
					this.hp = 100;
					this.damage = 25;
					this.size = {width: 2, height: 2};
					this.color = '#4d4d4d';
					// Used to define relationships with other animals
					this.strength = 50;
					this.speed = {
						wandering: 0.15,
						running: 0.3,
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
						wandering: 0.5,
						running: 0.75,
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
			this.isRunning = false;
			this.wanderingInterval = setInterval(this.startWandering, 5000);
		}
		annihilate() {
			this.pos.x = Infinity;
			clearInterval(this.wanderingInterval);
		}
		startWandering() {
			if (!this.isRunning) {
				cachedThis = this
				this.wanderingDir = createVector(Math.random() * 10 - 5, Math.random() * 10 - 5);
				this.wi = setInterval(function() {cachedThis.os.add(this.wanderingDir)}, 10);
				this.wdt = setTimeout(function() {clearInterval(cachedThis.wi)}, 5000);
				this = cachedThis
			}
		}
	}
}

setTimeout(function() {
	animals.push(new __Animal__(20, 20, 'sheep'));
	animals.push(new __Animal__(35, 35, 'wolf'));
}, 100);
document.addEventListener('mousedown', function(event) {
	if (event.button == 0) {
		if (map[event.clientX / pixelSize][event.clientY / pixelSize] != 'water' && map[event.clientX / pixelSize][event.clientY / pixelSize] != 'deepWater' && map[event.clientX / pixelSize][event.clientY / pixelSize] != 'shoreWater') {
			animals.push(new __Animal__(event.clientX / pixelSize, event.clientY / pixelSize, 'wolf'));
		}
	} else {
		if (map[event.clientX / pixelSize][event.clientY / pixelSize] != 'water' && map[event.clientX / pixelSize][event.clientY / pixelSize] != 'deepWater' && map[event.clientX / pixelSize][event.clientY / pixelSize] != 'shoreWater') {
			animals.push(new __Animal__(event.clientX / pixelSize, event.clientY / pixelSize, 'sheep'));
		}
	}
});

let fps = 0;
let fps_ = 0;

let ups = 0;
let ups_ = 0;

function apprEq(val1, val2, dist) {
	return +(val1 - val2) <= dist;
}

let animals = [];

function tick() {
	frameRate(0);
	for (animal of animals) {
		if (animal.predator) {
			for (victim of animals) {
				if (Math.pow(animal.pos.x - victim.pos.x, 2) + Math.pow(animal.pos.y - victim.pos.y, 2) <= Math.pow(animal.fov, 2)) {
					if (animal.type != victim.type) {
						if (animal.strength < victim.strength) {
							animal.pos.add(p5.Vector.sub(animal.pos, victim.pos).limit(animal.speed.running));
							animal.isRunning = true;
							//console.log(`Moved ${animal.type} from ${victim.type}`);
						} else {
							animal.pos.add(p5.Vector.sub(victim.pos, animal.pos).limit(animal.speed.running));
							animal.isRunning = true;
							//console.log(`Moved ${animal.type} to ${victim.type}`);
						}
					}
				}
			}
		} else {
			for (hunter of animals) {
				if (Math.sqrt(Math.pow(animal.pos.x - hunter.pos.x, 2) + Math.pow(animal.pos.y - hunter.pos.y, 2)) <= simulation.eatingDistance && hunter.predator) {
					animal.annihilate();
					console.log(`Annihilated ${animal.type}#${animal.ID}`);
				}
				if (Math.pow(animal.pos.x - hunter.pos.x, 2) + Math.pow(animal.pos.y - hunter.pos.y, 2) <= Math.pow(animal.fov, 2) && hunter.predator) {
					animal.pos.add(p5.Vector.sub(animal.pos, hunter.pos).limit(animal.speed.running));
					animal.isRunning = true;
					//console.log(`Moved ${animal.type} from ${hunter.type}`);
				} else {
					animal.isRunning = false;
				}
			}
		}

		if (animal.pos.x < 0) animal.pos.x = 0;
		if (animal.pos.y < 0) animal.pos.y = 0;
		if (animal.pos.x > mapSize[0]) animal.pos.x = mapSize[0] - 1.5;
		if (animal.pos.y > mapSize[1]) animal.pos.y = mapSize[1] - 1.5;
		
		if (animal.special.tracking) console.log(`${animal.type}:\n\t${animal.pos.x}:${animal.pos.y}`);
	}

	frameRate(dev.fpsLimit);
	ups_ += 1;
}

setInterval(tick, 5);
setInterval(function() {
	ups = ups_;
	ups_ = 0;

	fps = fps_;
	fps_ = 0;

	console.log(`FPS: ${fps} | UPS: ${ups}`);
}, 1000);

function draw() {
	noStroke();

	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
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
				case 'fire':
					fill(color('#eb8d00'));
					break;
				case 'coal':
					let rc = Math.floor(Math.random() * 3);
					switch (rc) {
						case 0:
							fill(color('#434750'));
							break;
						case 1:
							fill(color('#303136'));
							break;
						case 2:
							fill(color('#293133'));
							break;
					}
					break;
				case 'coal1':
					fill(color('#353942'));
					break;
				case 'coal2':
					fill(color('#303136'));
					break;
				case 'coal3':
					fill(color('#293133'));
					break;
			}
			rect(y * pixelSize, x * pixelSize, pixelSize, pixelSize);
		}
	}

	for (animal of animals) {
		fill(color(animal.color));
		rect(animal.pos.x * pixelSize, animal.pos.y * pixelSize, pixelSize, pixelSize);
	}

	fps_ += 1;
}
