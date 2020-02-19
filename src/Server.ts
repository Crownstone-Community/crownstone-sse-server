import {EventGenerator} from "./EventGenerator";
import {EventDispatcher} from "./EventDispatcher";
import {SocketManager} from "./socket/SocketManager";
const helmet = require('helmet')

const express = require('express');
const app = express();
const port = 8000;

SocketManager.setupConnection();

app.listen(process.env.PORT || port, () => {

  let baseUrl = process.env.BASE_URL || ("localhost:"+port);
  if (baseUrl.indexOf("http://") === -1 && baseUrl.indexOf("https://") === -1) {
    baseUrl = 'https://' + baseUrl
  }

  console.log('Web server listening at: %s', baseUrl);
})

app.use("/", express.static('public'))
app.use(helmet());

app.get('/sse', function(req, res) {
  res.writeHead(200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  });

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

