function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function doTest1(msg){
    await sleep(2000)
    return 5 - 4
}
async function doTest(msg){
    await sleep(2000)
    // console.log('Network')
    return msg
}

process.on('message', async (message) => {
    if (!message.hasOwnProperty('type')) {
        process.send({type: 'error', data: 'unknown message type'});
        return;
    }

    try {
        switch (message.type) {
        case 'test': {
            let result = await doTest(message.data);
            await sleep(200);
            process.send({type: 'success', data: result});
            break;
        }
        case 'test1': {
            let result = await doTest1(message);
            await sleep(200);
            process.send({type: 'success', data: result});
            break;
        }
        default: {
            process.send({type: 'error', data: 'unknown message type'});
        }
        }
    }
    catch (err) {
        process.send({type: 'error', data: err.toString()});
    }
});