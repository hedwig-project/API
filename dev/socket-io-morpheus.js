// const socket = require('socket.io-client')('http://138.197.83.143:9090')
const socket = require('socket.io-client')('http://localhost:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '8u982cmnijwfsdfsdfsd', '{"morpheusId":"8u982cmnijwfsdfsdfsd","type":"morpheus"}', ack => console.log(ack))
  socket.emit('confirmation', '8u982cmnijwfsdfsdfsd', '{"x":5}');
  socket.emit('confirmationReport', '8u982cmnijwfsdfsdfsd', '{"y":7}');
})

setInterval(() => socket.emit('data', '8u982cmnijwfsdfsdfsd', '[{"topic":"hw/dummymodule1234","controlParameters":[{"parameter":"ts","value":1500914158},{"parameter":"ty","value":"temp_umi_pres"}],"payload":{"s1":"umidade","vl1":88.2,"s2":"temperatura","vl2":25.6,"s3":"presenca","vl3":false,"s4":"rl1","vl4":false,"s5":"rl2","vl5":true}}]'), 5000);

socket.on('actionRequest', (morpheusId, data, cb) => {
  console.log(JSON.parse(data))
})

socket.on('disconnect', () => console.log('Disconnected'))
