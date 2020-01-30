import {EventGenerator} from "./EventGenerator";
import {EventDispatcher} from "./EventDispatcher";
import {SocketManager} from "./socket/SocketManager";

const express = require('express')
const app = express()
const port = 8000

SocketManager.setupConnection();

app.listen(port, () => console.log(`Server started at http://localhost:${port}!`))

app.get('/sse', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const accessToken = req.query.accessToken;
  if (!accessToken) {
    res.end( EventGenerator.getErrorEvent(401,"No accessToken provided...") );
  }

  if (SocketManager.isConnected() === false) {
    res.end(EventGenerator.getErrorEvent(500,"Not connected to cloud service. Try again later..."))
  }

  SocketManager.isValidAccessToken(accessToken)
    .then((validationResult) => {
      if (validationResult === false) {
        return res.end(EventGenerator.getErrorEvent(401,"No valid accessToken provided..."));
      }
      else {
        res.write(EventGenerator.getStartEvent());
        EventDispatcher.addClient(accessToken, req, res, validationResult);
      }
    })
    .catch((err) => {
      console.log("err", err)
      res.end(err);
    })

})

