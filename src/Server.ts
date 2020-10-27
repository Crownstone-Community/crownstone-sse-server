/// <reference path="./declarations/declarations.d.ts" />
import {Request, Response} from "express-serve-static-core"
import {EventGenerator} from "./EventGenerator";
import {EventDispatcher} from "./EventDispatcher";
import {SocketManager} from "./socket/SocketManager";
const helmet = require('helmet')

const express = require('express');
const app = express();
const port = 8000;

SocketManager.setCallback(EventDispatcher.dispatch)
SocketManager.setupConnection();

app.listen(process.env.PORT || port, () => {

  let baseUrl = process.env.BASE_URL || ("localhost:"+port);
  if (baseUrl.indexOf("http://") === -1 && baseUrl.indexOf("https://") === -1) {
    baseUrl = 'https://' + baseUrl;
  }

  console.log('Web server listening at: %s', baseUrl);
})

app.use("/", express.static('public'))
app.use(helmet());

app.get('/debug', function(req : Request, res : Response) {
  let validationToken = process.env.DEBUG_TOKEN || "debug"
  if (req.query.token === validationToken) {
    let debugInformation = {
      connected: SocketManager.isConnected(),
      amountOfConnections: Object.keys(EventDispatcher.clients).length
    };
    res.end(JSON.stringify(debugInformation))
  }
  else {
    res.end("Invalid token.")
  }
})

app.get('/sse', function(req : Request, res : Response) {
  let cancelled = false;
  req.once('close', () => { cancelled = true; });
  res.writeHead(200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  });

  const accessToken = req.query.accessToken;
  if (!accessToken) {
    res.end( EventGenerator.getErrorEvent(400,"NO_ACCESS_TOKEN", "No accessToken provided...") );
  }

  if (SocketManager.isConnected() === false) {
    res.end(EventGenerator.getErrorEvent(500, "NO_CONNECTION", "Not connected to cloud service. Try again later..."))
  }

  SocketManager.isValidToken(accessToken)
    .then((validationResult) => {
      // if the connection is cancelled before it is validated, do not start the connection
      if (cancelled) { return res.end(); }

      if (validationResult === false) {
        return res.end(EventGenerator.getErrorEvent(400,"NO_ACCESS_TOKEN", "No valid accessToken provided..."));
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

