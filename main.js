let kbKeysPressed = new Map();

let map = [
    []
];

const dev = {
    lines: true,
    fpsLimit: 30,
};

const pixelSize = 5;
const mapSize = [100, 100];

const generatorProperties = {
    islandsCount: 3,
    // This is not the actual size of the island, but a side
    // setting of the generator, only indirectly affecting its
    // size. Setting a value of 100 corresponds to a strict
    // (minimumWaterPercent * 100)% of water and
    // (100 - minimumWaterPercent * 100)% of land, but a
    // value of 99 does not guarantee that the island
    // consist of two or three cells (albeit with a small
    // probability).
    islandSize: 99,
    minimumWaterPercent: 0.25,
    minimumSolidTiles: 75,
    sandLayers: 2,
    shoreWaterLayers: 2,
    waterLayers: 2,
};

const simulation = {
    eatingDistance: 2,
};


function isTileNearby(x, y, type) {
    for (let ix = x - 1; ix < x + 2; ix++) {
        for (let iy = y - 1; iy < y + 2; iy++) {
            try {
                if (ix != x && iy != y && map[iy][ix] == type) {
                    return true;
                }
            } catch {}
        }
    }
    return false;
}


function replaceEvery(origin, target) {
    for (let y = 0; y < mapSize[1]; y++) {
        for (let x = 0; x < mapSize[0]; x++) {
            if (map[y][x] == origin) map[y][x] = target;
        }
    }
}


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
                    map[y][x] = 'deepWater';
                }
            }

            // Planting island
            for (let i = 0; i < generatorProperties.islandsCount; i++) {
                let randomPos = [Math.floor(Math.random() * mapSize[0]), Math.floor(Math.random() * mapSize[1])];
                map[randomPos[1]][randomPos[0]] = 'grass';
            }
            
            // Growing island up
            let enoughSolidTiles = false;
            let spreadLatch = 0;
            let spawnPos = 0;

            while (spreadLatch < generatorProperties.islandSize || !enoughSolidTiles) {
                for (let y = 0; y < mapSize[1]; y++) {
                    for (let x = 0; x < mapSize[0]; x++) {

                        if (map[y][x] == 'grass') {
                            spawnPos = Math.floor(Math.random() * 4);

                            switch (spawnPos) {

                                case 0:
                                    try {
                                        map[y][x - 1] = 'grass';
                                    } catch {}
                                    break;


                                case 1:
                                    try {
                                        map[y + 1][x] = 'grass';
                                    } catch {}
                                    break;

                                case 2:
                                    try {
                                        map[y][x + 1] = 'grass';
                                    } catch {}
                                    break;

                                case 3:
                                    try {
                                        map[y - 1][x] = 'grass';
                                    } catch {}

                                    break;
                            }
                        }
                    }
                }

                // Counting tiles' types
                // [water, land]
                let tilesCount = [0, 0];
                for (let y = 0; y < mapSize[1]; y++) {
                    for (let x = 0; x < mapSize[0]; x++) {
                        if (map[y][x] == 'grass') tilesCount[1] += 1;
                        else tilesCount[0] += 1;
                    }
                }

                if (tilesCount[0] / tilesCount[1] <= generatorProperties.minimumWaterPercent) break;
                
                spreadLatch = Math.random() * 101;
                console.log(`Generator says: current map props: ${tilesCount} (${(tilesCount[1] / (mapSize[0] * mapSize[1]) * 100).toFixed(2)}% solid)`);
                
                if (tilesCount[1] < generatorProperties.minimumSolidTiles) {
                    if (spreadLatch < generatorProperties.islandSize) console.log('Generator says: not enough tiles, adding iterations');
                    enoughSolidTiles = false;
                } else enoughSolidTiles = true;
            }

            // Sand generation
            for (let y = 0; y < mapSize[1]; y++) {
                for (let x = 0; x < mapSize[0]; x++) {
                    try {
                        if ((map[y][x] == 'grass' || map[y][x] == 'sand') && (map[y][x - 1] == 'deepWater' || map[y + 1][x] == 'deepWater' || map[y][x + 1] == 'deepWater' || map[y - 1][x] == 'deepWater')) {
                            map[y][x] = 'sand';
                        }
                    } catch {}
                }
            }

            for (let generated_layers = 0; generated_layers < generatorProperties.sandLayers - 1; generated_layers++) {
                for (let y = 0; y < mapSize[1]; y++) {
                    for (let x = 0; x < mapSize[0]; x++) {
                        if (map[y][x] == 'sand') {
                            for (let y1 = y - 1; y1 < y + 1; y1++) {
                                try {
                                    for (let x1 = x - 1; x1 < x + 1; x1++) {
                                        if (map[y1][x1] == 'grass') {
                                            map[y1][x1] = 'sand';
                                        }
                                    }
                                } catch {}
                            }
                        }
                    }
                }
            }

            // Water leveling
            for (let swl = 0; swl < generatorProperties.shoreWaterLayers; swl++) {
                for (let y = 0; y < mapSize[1]; y++) {
                    for (let x = 0; x < mapSize[0]; x++) {
                        if ((map[y][x] == 'deepWater') && (isTileNearby(x, y, 'sand') || isTileNearby(x, y, 'shoreWater'))) {
                            map[y][x] = '*'
                        }
                    }
                }
            }
            replaceEvery('*', 'shoreWater')

            for (let swl = 0; swl < generatorProperties.waterLayers; swl++) {
                for (let y = 0; y < mapSize[1]; y++) {
                    for (let x = 0; x < mapSize[0]; x++) {
                        if ((map[y][x] == 'deepWater') && isTileNearby(x, y, 'shoreWater')) {
                            map[y][x] = '*'
                        }
                    }
                }
            }
            replaceEvery('*', 'water')

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
        constructor(x, y, type, special = {
            tracking: false,
        }) {
            this.ID = nextID;
            nextID++;
            this.pos = createVector(x, y);
            this.type = type;
            this.special = special;
            this.target = null;
            switch (type) {
                case 'wolf':
                    this.hp = 100;
                    this.damage = 25;
                    this.size = {
                        width: 2,
                        height: 2
                    };
                    this.color = '#4d4d4d';
                    // Used to define relationships with other animals
                    this.strength = 50;
                    this.speed = {
                        wandering: 0.1,
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
                    this.size = {
                        width: 2,
                        height: 2
                    };
                    this.color = '#ffffff';
                    this.strength = 10;
                    this.speed = {
                        wandering: 0.1,
                        running: 0.4,
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
                    this.size = {
                        width: 2,
                        height: 2
                    };
                    this.color = '#995400';
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
            // this.wanderingInterval = setInterval(() => this.startWandering(), 5000);

        }
        annihilate() {
            this.pos.x = Infinity;
            clearInterval(this.wanderingInterval);
        }
        startWandering() {
            if (!this.isRunning) {
                let cachedThis = this;
                cachedThis.wanderingDir = createVector(Math.random() * 10 - 5, Math.random() * 10 - 5);
                cachedThis.wi = setInterval(function() {
                    cachedThis.pos.add(cachedThis.wanderingDir);
                }, 10);
                this.wdt = setTimeout(function() {
                    clearInterval(cachedThis.wi);
                }, 5000);
            }
        }
    }
}

setTimeout(function() {
    animals.push(new __Animal__(20, 20, 'sheep'));
    // animals.push(new __Animal__(35, 35, 'wolf'));
}, 100);

document.addEventListener('mousedown', function(event) {
    let animal = '';
    let target = {
        x: Math.floor(event.pageX / pixelSize),
        y: Math.floor(event.pageY / pixelSize)
    }

    // Add a check to ensure that the calculated indices are within the bounds of the map array.
    if (target.x >= 0 && target.x < mapSize[0] && target.y >= 0 && target.y < mapSize[1]) {
        if (map[target.y][target.x] != 'water' && map[target.y][target.x] != 'deepWater' && map[target.y][target.x] != 'shoreWater') {
            if (event.button == 0) {
                animal = 'wolf';
            } else {
                animal = 'sheep';
            }
            animals.push(new __Animal__(target.x, target.y, animal));
        }
    }
});

let fps = 0;
let fpls = 0;

let ups = 0;
let upls = 0;

function apprEq(val1, val2, dist) {
    return +(val1 - val2) <= dist;
}

let animals = [];

function tick() {
    frameRate(0);
    for (let animal of animals) {
        if (animal.predator) {
            let vector = createVector(0, 0);
            let targets = []

            for (let victim of animals) {
                if (Math.pow(animal.pos.x - victim.pos.x, 2) + Math.pow(animal.pos.y - victim.pos.y, 2) <= Math.pow(animal.fov, 2)) {
                    if (animal.type != victim.type) {
                        animal.isRunning = true;
                        if (animal.strength < victim.strength) {
                            vector.add(p5.Vector.sub(animal.pos, victim.pos));
                            targets.push(p5.Vector.sub(animal.pos, victim.pos));

                            break;
                            // console.log(`Moved ${animal.type} from ${victim.type}`);
                        } else {
                            vector.add(p5.Vector.sub(victim.pos, animal.pos));
                            // console.log(`Moved ${animal.type} to ${victim.type}`);
                        }
                    }
                }
            }

            targets.sort((a, b) => a.mag() - b.mag());
            if (targets.length) {
                animal.target = targets[0];
                animal.pos.add(animal.target.add((Math.random() * 2 - 1) * (animal.target != null), (Math.random() * 2 - 1) * (animal.target != null)).limit(animal.speed.running));
            } else {
                animal.target = null;
            }
        } else {
            let vector = createVector(0, 0);

            for (let hunter of animals) {
                if (Math.sqrt(Math.pow(animal.pos.x - hunter.pos.x, 2) + Math.pow(animal.pos.y - hunter.pos.y, 2)) <= simulation.eatingDistance && hunter.predator) {
                    animal.annihilate();
                    console.log(`Annihilated ${animal.type}#${animal.ID}`);
                }
            }

            for (let hunter of animals) {
                if (Math.pow(animal.pos.x - hunter.pos.x, 2) + Math.pow(animal.pos.y - hunter.pos.y, 2) <= Math.pow(animal.fov, 2) && hunter.predator) {
                    vector.add(p5.Vector.sub(animal.pos, hunter.pos));
                    animal.isRunning = true;
                    // console.log(`Moved ${animal.type} from ${hunter.type}`);
                } else {
                    animal.isRunning = false;
                }
            }

            animal.pos.add(vector.limit(animal.speed.running));
        }

        if (animal.pos.x < 0) animal.pos.x = 0;
        if (animal.pos.y < 0) animal.pos.y = 0;
        if (animal.pos.x > mapSize[0]) animal.pos.x = mapSize[0] - 1.5;
        if (animal.pos.y > mapSize[1]) animal.pos.y = mapSize[1] - 1.5;

        if (animal.special.tracking) console.log(`${animal.type}:\n\t${animal.pos.x}:${animal.pos.y}`);
    }

    frameRate(dev.fpsLimit);
    upls += 1;
}

// Tick speed placed here
setInterval(tick, 5);
setInterval(function() {
    ups = upls;
    upls = 0;

    fps = fpls;
    fpls = 0;

    // console.log(`FPS: ${fps} | UPS: ${ups}`);
}, 1000);

function draw() {
    noStroke();

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            switch (map[y][x]) {
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
            // FLAG
            rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
    }

    for (let animal of animals) {
        fill(color(animal.color));
        rect(animal.pos.x * pixelSize, animal.pos.y * pixelSize, pixelSize, pixelSize);
    }

    fpls += 1;
}
