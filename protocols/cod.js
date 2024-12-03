const dgram = require('dgram');

module.exports = {
    name: 'cod',
    async check(watcher) {
        const startTime = Date.now();
        const client = dgram.createSocket('udp4');
        const getInfoPacket = Buffer.concat([
            Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]),
            Buffer.from('getInfo ' + Math.random().toString(36).substring(2, 15))
        ]);

        return new Promise((resolve) => {
            let responseReceived = false;

            client.on('message', (message) => {
                const prefix = Buffer.concat([
                    Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]),
                    Buffer.from('infoResponse')
                ]);
                if (message.subarray(0, prefix.length).equals(prefix)) {
                    responseReceived = true;
                    client.close();
                    resolve({
                        up: true,
                        responseTime: Date.now() - startTime,
                        message: 'Server responded to getInfo'
                    });
                }
            });

            client.on('error', (error) => {
                client.close();
                resolve({
                    up: false,
                    responseTime: Date.now() - startTime,
                    message: `Error: ${error.message}`
                });
            });

            setTimeout(() => {
                if (!responseReceived) {
                    client.close();
                    resolve({
                        up: false,
                        responseTime: Date.now() - startTime,
                        message: 'Timeout waiting for response'
                    });
                }
            }, watcher.timeout || 5000);

            client.send(getInfoPacket, watcher.port || 28960, watcher.host, (error) => {
                if (error) {
                    client.close();
                    resolve({
                        up: false,
                        responseTime: Date.now() - startTime,
                        message: `Send failed: ${error.message}`
                    });
                }
            });
        });
    }
};