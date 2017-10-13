const socket = require('socket.io-client')('http://138.197.83.143:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '{"morpheusId":"adf654wae84fea5d8ea6","type":"morpheus"}', ack => console.log(ack))
  socket.emit('confirmation', '{"x":5}');
  socket.emit('confirmationReport', '{"y":7}');
})

setInterval(() => socket.emit('data', '{"data":"data"}'), 5000);

socket.on('action', (data, cb) => {
  console.log(JSON.parse(data))
})

socket.on('disconnect', () => console.log('Disconnected'))
