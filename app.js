const express = require('express')
const app = express()
const compression = require('compression')
const NUMOFCPUS = require('os').cpus().length
const { runWorkers, stop } = require('./workerThread')
require('./config')
const PORT = 3000
const RESETCOUNTER = 10000
let requestCounter = 0

app.use(compression())
app.use((req, res, next) => {
    if( requestCounter >= RESETCOUNTER) {
        stop()
        requestCounter = 1
    }
    requestCounter++
    next()
})

app.post('/test', async(req, res) => {
    let data = [1,2,3,4,5,6,7,8,9,10,11,12,13]
    console.log(global.NETWORK)
    const results = await runWorkers(NUMOFCPUS, {type: 'test', data: data})
    // console.log(processes)
    // stop()
    res.send(results)
})

app.get('/test1', async(req, res) => {
    const results = await runWorkers(NUMOFCPUS, {type: 'test1'})
    // console.log(processes)
    // stop()
    res.send(results)
})
app.listen(PORT, ()=> {
    console.log('Server start listening at Port', PORT)
})