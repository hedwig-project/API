const socket = require('socket.io-client')('http://localhost:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '{"morpheusId":"mockid1234","type":"dashboard"}', ack => console.log(ack))
})

setInterval(() => socket.emit('action', {"action":"data"}), 5000);

socket.on('data', (data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('confirmation', (data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('confirmationReport', (data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('disconnect', () => console.log('Disconnected'))
