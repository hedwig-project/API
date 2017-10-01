const socket = require('socket.io-client')('http://localhost:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '{"morpheusId":"mock-id-1234","type":"morpheus"}', ack => console.log(ack))
  socket.emit('data', '{"x":5}');
})

socket.on('configuration', (data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('disconnect', () => console.log('Disconnected'))
