const WebSocket = require('faye-websocket'),
	  http      = require('http'),
	  net 		= require('net');

var httpServer = http.createServer();

httpServer.on('upgrade', function(request, socket, body) {
	if (WebSocket.isWebSocket(request)) {
		var client = new WebSocket(request, socket, body);
		var server = null;

		client.on('message', function(event) {
			console.log("Received "+ event.data);

			if (server == null) {
				const connectionString = event.data.split(' ');

				if (connectionString[0].startsWith("CONNECT")) {
					server = net.connect(connectionString[2], connectionString[1], function() {
						console.log('Connected to server!');
						client.send("CONNECTED");
					});

					server.on('data', function(data) {
                        console.log(data);
						client.send(data);
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
				server.write(event.data);
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