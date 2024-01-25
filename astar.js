function accessableZone(map, x, y) {
    /**
     * @param  {Array[][]} map
     * @param  {int}       x
     * @param  {int}       y
     * @return {Array[][]}
     */

    let explorable = [[x, y]];
    let explored = [[x, y]];
    let accessable = [];

    while (explorable.length > 0) {
        let newExplorable = explorable;

        for (let i = 0; i < explorable.length; i++) {
        
            try {
                if (map[explorable[i][1]][explorable[i][0]] == 1) {
                    accessable.push(explorable[i]);

                    newExplorable.push([explorable[i][1] + 1, explorable[i][0]]);
                    newExplorable.push([explorable[i][1] - 1, explorable[i][0]]);
                    newExplorable.push([explorable[i][1], explorable[i][0] + 1]);
                    explorable.push([explorable[i][1], explorable[i][0] - 1]);
                }
            } catch {}
        
            // console.log(i, explorable.length)
            newExplorable.shift();
            explored.push(explorable[i]);
        }
        
        explorable = newExplorable;
    }

    accessable = accessable.filter((value, index, self) => {
        return index === self.findIndex((t) => {
            return JSON.stringify(t) === JSON.stringify(value);
        });
    });

    return accessable;
}


function getFartherIndex(map, x, y) {
    /**
     * @param  {Array[][]} map
     * @param  {int}       x
     * @param  {int}       y
     * @return {Array[2]}
     */

    let maxDistance = 0;
    let outputCoordinates = [x, y];

    for (let ty = 0; y < map.length; y++) {
        for (let tx = 0; x < map[ty].length; x++) {
            if (map[ty][tx] == 1) {
                let distance = Math.sqrt(+(x - tx) + +(y - tx));
                if (distance > maxDistance) {
                    maxDistance = distance;
                    outputCoordinates = [tx, ty];
                }
            }
        }
    }

    return outputCoordinates;
}