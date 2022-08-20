let kbKeysPressed = new Map();

let map = [[]];

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

let pixelSize = 10;
let mapSize = [80, 80];
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

			while (let sl = 0; sl < generatorProperties.sandLayers - 1; sl++) {
				for (let y = 0; y < mapSize[1]; y++) {
					for (let x = 0; x < mapSize[0]; x++) {
						if (map[x][y] == 'sand') {
							for (let y1 = y - 1; y1 < y + 1; y1++) {
								for (let x1 = x - 1; x1 < x + 1; x1++) {
									if (map[x1][y1] == 'grass') {
										map[x1][y1] = 'sand';
									}
								}
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

function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	generateWorld('classic');
}

let fps = 0;
let fps_ = 0;

let ups = 0;
let ups_ = 0;

function tick() {
	ups_ += 1;
}

setInterval(tick, 10);
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

	fps_ += 1;
}
