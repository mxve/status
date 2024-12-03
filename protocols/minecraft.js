const net = require('net');

module.exports = {
    name: 'minecraft',
    async check(watcher) {
        const startTime = Date.now();
        const socket = new net.Socket();

        return new Promise((resolve) => {
            socket.setTimeout(watcher.timeout || 5000);

            socket.on('connect', () => {
                socket.destroy();
                resolve({
                    up: true,
                    responseTime: Date.now() - startTime,
                    message: 'Server is accepting connections'
                });
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    up: false,
                    responseTime: Date.now() - startTime,
                    message: 'Connection timed out'
                });
            });

            socket.on('error', (error) => {
                resolve({
                    up: false,
                    responseTime: Date.now() - startTime,
                    message: error.message
                });
            });

            socket.connect(watcher.port || 25565, watcher.host);
        });
    }
};