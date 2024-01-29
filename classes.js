let nextID = 0;


class Animal {

    constructor(x, y, type, special = {
        tracking: false,
    }) {

        this.ID = nextID;
        nextID++;
        this.pos = createVector(x, y);
        this.type = type;
        this.special = special;
        this.target = null;
        this.color = '#000000';

        this.isRunning = false;
        // this.wanderingInterval = setInterval(() => this.startWandering(), 5000);

    }

    annihilate() {
        clearInterval(this.wanderingInterval);
        animals = animals.filter(animal => animal.ID != this.ID);
        delete this;
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


class Wolf extends Animal {

    constructor(x, y, special = {
        tracking: false
    }) {

        super(x, y, 'wolf', special);

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
            sand: 0.3 * 0.5
        };
        this.fov = 20;
        this.surfaces = {
            land: true,
            water: false
        };
        this.flies = false;
        this.predator = true;
    }
}


class Sheep extends Animal {

    constructor(x, y, special = {
        tracking: false
    }) {

        super(x, y, 'sheep', special);

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
            sand: 0.4 * 0.5
        };
        this.fov = 15;
        this.surfaces = {
            land: true,
            water: false
        };
        this.flies = false;
        this.predator = false;
    }
}


class Lion extends Animal {

    constructor(x, y, special = {
        tracking: false
    }) {

        super(x, y, 'lion', special);

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
            running: 0.3,
            sand: 0.3 * 0.5
        };
        this.fov = 20;
        this.surfaces = {
            land: true,
            water: false
        };
        this.flies = false;
        this.predator = true;
    }
}


class Missile extends Animal {

    constructor(x, y, special = {
        tracking: false
    }) {

        super(x, y, 'missile', special);

        this.hp = 1000;
        this.damage = 100;
        this.size = {
            width: 2,
            height: 2
        };
        this.color = '#999999';
        this.strength = 10000;
        this.speed = {
            wandering: 1,
            running: 5,
            sand: 5
        };
        this.fov = 1000;
        this.surfaces = {
            land: true,
            water: true
        };
        this.flies = true;
        this.predator = true;   
    }
}