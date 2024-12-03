const net = require('net');

module.exports = {
    name: 'minecraft',
    async check(watcher) {
        const startTime = Date.now();
        const socket = new net.Socket();

        return new Promise((resolve) => {
            let buffer = Buffer.alloc(0);
            socket.setTimeout(watcher.timeout || 5000);

            function writeVarInt(value) {
                let bytes = [];
                while (true) {
                    let temp = value & 0b01111111;
                    value >>>= 7;
                    if (value != 0) {
                        temp |= 0b10000000;
                    }
                    bytes.push(temp);
                    if (value == 0) {
                        break;
                    }
                }
                return Buffer.from(bytes);
            }

            function createHandshakePacket(host, port) {
                const hostBytes = Buffer.from(host, 'utf8');
                const packet = Buffer.concat([
                    writeVarInt(0x00),
                    writeVarInt(47),
                    writeVarInt(host.length),
                    hostBytes,
                    Buffer.from([port >> 8, port & 0xFF]),
                    writeVarInt(1)
                ]);
                return Buffer.concat([writeVarInt(packet.length), packet]);
            }

            function createStatusRequestPacket() {
                return Buffer.from([0x01, 0x00]);
            }

            socket.on('connect', () => {
                try {
                    const handshake = createHandshakePacket(watcher.host, watcher.port || 25565);
                    const statusRequest = createStatusRequestPacket();
                    socket.write(handshake);
                    socket.write(statusRequest);
                } catch (error) {
                    socket.destroy();
                    resolve({
                        up: false,
                        responseTime: Date.now() - startTime,
                        message: `Handshake failed: ${error.message}`
                    });
                }
            });

            socket.on('data', (data) => {
                buffer = Buffer.concat([buffer, data]);

                if (buffer.length > 0) {
                    socket.destroy();
                    resolve({
                        up: true,
                        responseTime: Date.now() - startTime,
                        message: 'Server responded to handshake'
                    });
                }
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