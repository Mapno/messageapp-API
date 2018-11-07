## Messageapp client

Client which sends and retrieves messages from endpoint /message.

# Config

´´´
npm install
const Client = requiere('messageapp-client')
const client = new Client(hostname, port)
´´´

The client takes two arguments: hostname and port.

#Methods

´´´ client.send(destination, message) ´´´ sends a POST request to endpoint /message and returns 'OK' or detailed error.

´´´ client.retrieveMessages() ´´´ retrieves all messages from database.

