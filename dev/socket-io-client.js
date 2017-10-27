// const socket = require('socket.io-client')('http://138.197.83.143:9090')
const socket = require('socket.io-client')('http://localhost:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '8u982cmnijwfsdfsdfsd', '{"morpheusId":"8u982cmnijwfsdfsdfsd","type":"dashboard"}', ack => console.log(ack))
})

const action = [
  {
		'topic': 'hw/000281D0',
		'controlParameters': [
			{
				'parameter': 'ts',
				'value': 150091415
			},
			{
				'parameter': 'ty',
				'value': 'rele1_action'
			}
	    ],
	    'payload': {
	    	'v1': 5,
	    	'v2': 'auto'
	    }
	},
];

setInterval(() => socket.emit('actionRequest', '8u982cmnijwfsdfsdfsd', action), 5000);

socket.on('data', (morpheusId, data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('confirmation', (morpheusId, data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('confirmationReport', (morpheusId, data, cb) => {
  console.log(JSON.stringify(data))
})

socket.on('disconnect', () => console.log('Disconnected'))
