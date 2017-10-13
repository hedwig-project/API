const socket = require('socket.io-client')('http://138.197.83.143:9090')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('hello', '{"morpheusId":"adf654wae84fea5d8ea6","type":"dashboard"}', ack => console.log(ack))
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

setInterval(() => socket.emit('actionRequest', action), 5000);

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
