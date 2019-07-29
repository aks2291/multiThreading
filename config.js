

function setConfig() {
    global.NETWORK = {
        name : 'Ram',
        role : 'Developer'
    }
    console.log("set config: ", global.NETWORK)
}

async function getConfig() {
    console.log('Get config')
    return network
}

// console.log(network)
if (!global.NETWORK) {
    setConfig()
}

module.exports = {
    setConfig,
    getConfig
}