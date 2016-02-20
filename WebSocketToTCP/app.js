const WebSocket = require('faye-websocket'),
	  http      = require('http'),
	  net 		= require('net');

var httpServer = http.createServer();

httpServer.on('upgrade', function(request, socket, body) {
	if (WebSocket.isWebSocket(request)) {
		var client = new WebSocket(request, socket, body);
		var server = null;

		client.on('message', function(event) {
			console.log("Received "+ new Buffer(event.data, "base64").toString());

			if (server == null) {
				const connectionString = new Buffer(event.data, "base64").toString().split(' ');

				if (connectionString[0].startsWith("CONNECT")) {
					server = net.connect(connectionString[2], connectionString[1], function() {
						console.log('Connected to server!');
						client.send(new Buffer("CONNECTED").toString("base64"));
					});

					server.on('data', function(data) {
                        console.log(data);
						client.send(data.toString("base64"));
					});

					server.on('end', function() {
						console.log('Disconnected from server');
						client.close();
					});
				} else {
					client.send("Connection string expected");
					client.close();
				}
			} else {
				server.write(new Buffer(event.data, "base64"));
			}
		});

		client.on('close', function(event) {
			console.log('close', event.code, event.reason);
			client = null;
			if (server != null)
				server.end();
		});
	}
});

httpServer.listen(8001);