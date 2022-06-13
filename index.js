const _ = require("lodash")
let cities = [
    {name:"A",cityIndex: 0,cost: [0,4,4,7,3]},
    {name:"B",cityIndex: 1,cost: [4,0,2,3,5]},
    {name:"C",cityIndex: 2,cost: [4,2,0,2,3]},
    {name:"D",cityIndex: 3,cost: [7,3,2,0,7]},
    {name:"E",cityIndex: 4,cost: [3,5,3,6,0]},
]

let mutationChance = 40
let crossOverChance = 10

function createRandomPaths(howManyPaths){
    let paths = _.fill(Array(howManyPaths),0).map(x=> {
        let shuffledPath = _.shuffle(cities)
        let firstElement = _.first(shuffledPath)
        shuffledPath.push(firstElement)
        return shuffledPath
    })
    return paths
}

function calculatePathCost(path){
    let timesRun = 0
    let costTotal = 0
    path.forEach(city =>{
        let indexOfCity = path.indexOf(city)
        //Prevent add cost of last element with itself
        if(timesRun+1 < path.length){
            costTotal+= path[indexOfCity+1].cost[city.cityIndex]
        }
        timesRun+=1
    })
    return costTotal
}

function calculateFitnessFromCost(cost){
    return 100/cost
}

function mutatePath(path){
    //Mutate cities
    let mutationArray = path
    let arrayToShuffle = mutationArray.slice(1,-1)
    arrayToShuffle = _.shuffle(arrayToShuffle)
    arrayToShuffle.unshift(mutationArray[0])
    arrayToShuffle.push(mutationArray[0])
    return arrayToShuffle
}

function singlePointCrossOver(paths){
    //Pick 2 Random Parents
    let randomPaths = _.shuffle([...paths])
    let parent1 = randomPaths.pop()
    let parent2 = randomPaths.shift()
    let randomCrossPoint = _.random(1,parent1.length-1)
    let child1 = [...parent1.slice(0,randomCrossPoint),...parent2.slice(randomCrossPoint,parent2.length)]
    let child2 = [...parent1.slice(randomCrossPoint,parent1.length),...parent2.slice(0,randomCrossPoint)]
    //Make arrays unique and first and last points same
    child1[child1.length-1] = child1[0]
    child2[child2.length-1] = child2[0]

    //Remove duplciates and replace them with left over
    child1 = child1.map(((s, i) => v => {
        if (!s.has(v)) {
            s.add(v);
            return v;
        }
        while (s.has(cities[i])) ++i;
        s.add(cities[i]);
        if(!cities[i]) return v
        return cities[i];
    })(new Set, 0));

    child2 = child2.map(((s, i) => v => {
        if (!s.has(v)) {
            s.add(v);
            return v;
        }
        while (s.has(cities[i])) ++i;
        s.add(cities[i]);
        if(!cities[i]) return v
        return cities[i];
    })(new Set, 0));

    paths[paths.indexOf(parent1)] = child1
    paths[paths.indexOf(parent2)] = child2
    console.log(`Single Point cross Over [CrossPoint: ${randomCrossPoint}]\nParent1: ${parent1.map(city => `${city.name} -> `).join("").slice(0,-3)}\nParent2: ${parent2.map(city => `${city.name} -> `).join("").slice(0,-3)}\n\n\nChild1: ${child1.map(city => `${city.name} -> `).join("").slice(0,-3)}\nChild2: ${child2.map(city => `${city.name} -> `).join("").slice(0,-3)}`)

    return paths
}
async function runGeneticAlgorithm(howManyPaths,FitnessLimit){
    let isFitnessLimitReached = false
    let bestPath = null
    let timesRun = 1
    //Create random Paths

    let paths = createRandomPaths(howManyPaths)

    while (!isFitnessLimitReached){
        console.log(`---------------------[${timesRun}]---------------------`)
        paths.forEach(path=>{
            let cost = calculatePathCost(path)
            let fitness = calculateFitnessFromCost(cost)
            if( fitness >= FitnessLimit){
                isFitnessLimitReached = true
                bestPath = path
            }
            console.log(`Cost: ${cost}\nFitness: ${fitness}\n Path: ${path.map(city => `${city.name} -> `).join("").slice(0,-3)}`)
            console.log("----------------------------------------------------------")
        })
        //Mutate some with chance
        paths.forEach(path=>{
            let random = Math.random();
            if(random < mutationChance/100){
                let mutatedPath = mutatePath(path)
                paths[paths.indexOf(path)] = mutatedPath
                console.log(` Path: ${path.map(city => `${city.name} -> `).join("").slice(0,-3)} Mutated into path ${mutatedPath.map(city => `${city.name} -> `).join("").slice(0,-3)}`)

            }
        })
        //CrossOver some with Chance
        let random = Math.random()
        if(random < crossOverChance/100){
            paths = singlePointCrossOver(paths)
        }
        timesRun+=1
    }
    console.log("----------------------------------------------------------")
    console.log("Fitness Limit Reached:")
    console.log(`Cost: ${calculatePathCost(bestPath)}\nFitness: ${calculateFitnessFromCost(calculatePathCost(bestPath))}\n Path: ${bestPath.map(city => `${city.name} -> `).join("").slice(0,-3)}`)
    console.log("----------------------------------------------------------")
}

runGeneticAlgorithm(5,6)