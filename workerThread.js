const path = require('path')
const childProcess = require('child_process')

let processes = {} // {pid: {obj, promise}}
let results = []

/**
 * Returns array of subarrays(# = number)
 * @param {Array Objec} data Array to be splitted
 * @param {Number} number(default 4) number of split (# of sub-arrays)
 */
async function chunks(data, number = 4) {
    let splitedArray = []
    let chunkSize = parseInt(data.length/number)

    for ( let index = 0; index < number; index++) {
        if(index === number - 1){
            splitedArray.push(data.splice(0))
        }
        else {
            splitedArray.push(data.splice(0, chunkSize))
        }
    }
    return splitedArray
} 

/**
 * Call the Promise function for a process
 * @param {String} pid pid of the process
 * @param {Boolean} isResolve indicates resolve(true) or reject(false)
 * @param {Object} msg input for the Promise function
 */
function setPromise(pid, isResolve, msg) {
    let p = processes[pid]
    if(p && p.promise && typeof p.promise !== 'undefined') {
        if(isResolve) {
            p.promise.resolve(msg)
        }
        else {
            p.promise.reject(msg)
        }
    }
}

/**
 * Push test result from a child process into the global array
 * @param {String} pid pid of the child process
 * @param {Object} data test result
 */
function pushResult(pid, data) {
    // let p = processes[pid];
    // if(p && p.results && typeof p.results !== 'undefined') {
    //     p.results.push({pid,data});
    // }
    results.push({pid, data})
}

/**
 * Launch a child process to do the test
 * @param {Array} results array to save the test results
 */
function workerTheard() {
    let child = childProcess.fork(path.join(__dirname, 'task.js'));
    let pid   = child.pid.toString()
    processes[pid] = {obj: child}

    child.on('message', function(msg) {
        if(msg.type === 'success') {
            pushResult(pid, msg.data);
            setPromise(pid, true, null);
        }
        else if(msg.type === 'error') {
            setPromise(pid, false, new Error('Thread encountered error' + msg.data))
        }
    })

    child.on('error', function(){
        setPromise(pid, false, new Error('Thread encountered unexpected error'))
    })

    child.on('exit', function(code, signal) {
        console.log('Thread exited pid:' + pid)
        setPromise(pid, false, new Error('Thread already exited'))
    })
}

async function runWorkers(number, message) {
    let count = 0;
    results = []
    for(let i in processes) {
        i; // avoid eslint error
        count++;
    }

    if(count !== number) {
        processes = {};
        for(let i = 0; i < number; i++) {
            workerTheard()
        }
    }
    const splitedArray = await chunks(message.data, number)
    let promises = [];
    let index = 0
    for(let id in processes) {
        let worker = processes[id]
        let p = new Promise((resolve, reject) => {
            worker.promise = {
                resolve: resolve,
                reject: reject
            }
        })

        promises.push(p)
        // worker.results = results
        worker.obj.send({type: message.type, data: splitedArray[index]})
        index++
    }

    await Promise.all(promises)
    // clear promises
    for(let worker in processes) {
        delete worker.promise
    }

    return results
}

// function sendMessage(message) {
//     for(let pid in processes) {
//         processes[pid].obj.send(message);
//     }
//     return results;
// }

/**
 * Stop all test clients(child processes)
 */
function stop() {
    for(let pid in processes) {
        processes[pid].obj.kill();
    }
    processes = {};
}

// chunks([1,2,3,4,5,6,7,8,9], 4).then(data => {
//     console.log(data)
// })

module.exports = {
    runWorkers,
    stop,
    // sendMessage
}