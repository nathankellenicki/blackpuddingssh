const ws = require("nodejs-websocket")
const net = require('net');
 
var server = ws.createServer(function (conn) {
	console.log("New connection")
	var client = null;

	conn.on("text", function (str) {
		console.log("Received "+str)

		if (client == null) {
			const connectionString = str.split(' ');

			if (connectionString[0].startsWith("CONNECT")) {
				client = net.connect(connectionString[2], connectionString[1], function() {
					console.log('connected to server!');
					conn.sendText("CONNECTED");
				});

				client.on('data', function(data) {
					conn.sendText(data);
				});

				client.on('end', function() {
					console.log('disconnected from server');
					conn.close();
				});
			} else {
				conn.sendText("Connection string expected");
				conn.close();
			}
		} else {
			client.write(str);
		}
	});

	conn.on("close", function (code, reason) {
		console.log("Connection closed");
		if (client != null)
			client.end();
	});

	conn.on("error", function(error) {
		console.error(error.message);
		if (client !=null )
			client.write(error.message);
	});

}).listen(8001);
