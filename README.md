This is the SSE server which connects to the Crownstone Cloud via websocket (socket.io).

Users can connect to this service with an accessToken query parameter.

To install, run:

```bash
yarn
```

then

```bash
npm start
```


The shared secret is stored in an environmental variable called:
 
```
CROWNSTONE_CLOUD_SSE_TOKEN
```

The socket.io URL is stored in an environmental variable called:

```
CROWNSTONE_CLOUD_SOCKET_ENDPOINT
```