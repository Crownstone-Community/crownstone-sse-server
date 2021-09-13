/// <reference path="./declarations/declarations.d.ts" />
import {Request, Response} from "express-serve-static-core"
import {EventGenerator} from "./EventGenerator";
import {EventDispatcher} from "./EventDispatcher";
import {SocketManager, SocketManager_next} from "./socket/SocketManagers";
const helmet = require('helmet')

const express = require('express');
const app = express();
const port = 8000;


if (process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"]) {
  SocketManager.setCallback(EventDispatcher.dispatch.bind(EventDispatcher))
  SocketManager.setupConnection(process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"] as string);
}

if (process.env["CROWNSTONE_CLOUD_NEXT_SOCKET_ENDPOINT"]) {
  SocketManager_next.setCallback(EventDispatcher.dispatch.bind(EventDispatcher))
  SocketManager_next.setupConnection(process.env["CROWNSTONE_CLOUD_NEXT_SOCKET_ENDPOINT"] as string);
}

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
      connectedNext: SocketManager_next.isConnected(),
      amountOfConnections: Object.keys(EventDispatcher.clients).length
    };
    res.end(JSON.stringify(debugInformation))
  }
  else {
    res.end("Invalid token.")
  }
})


app.get('/sse', async function(req : Request, res : Response) {
  const accessToken = extractToken(req);
  if (!accessToken) {
    console.warn("Request received without access token!");
    res.end(EventGenerator.getErrorEvent(400,"NO_ACCESS_TOKEN", "No accessToken provided...") );
    return;
  }

  // we only need to connect this incoming request to the legacy cloud. It will handle all the bookkeeping and the token validation.
  let cancelled = false;
  req.once('close', () => { cancelled = true; });
  res.writeHead(200, {
    'Connection': 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  });


  if (SocketManager.isConnected() === false) {
    console.warn("Attempted to connect to the SSE while it wasnt connected to the cloud.");
    res.end(EventGenerator.getErrorEvent(500, "NO_CONNECTION", "Not connected to cloud service. Try again later..."))
    return;
  }

  let validationResult;
  try {
    validationResult = await SocketManager.isValidToken(accessToken)
  }
  catch (err) {
    console.log("Error in SocketManager.isValidToken", err)
    return res.end(err);
  }

  // if the connection is cancelled before it is validated, do not start the connection
  if (cancelled) {
    console.warn("Cancelled request after validation.");
    return res.end();
  }

  if (validationResult === false) {
    console.warn("Request received without VALID access token!");
    return res.end(EventGenerator.getErrorEvent(400,"NO_ACCESS_TOKEN", "No valid accessToken provided..."));
  }
  else {
    res.write(EventGenerator.getStartEvent());

    // @ts-ignore
    EventDispatcher.addClient(accessToken, req, res, validationResult);
  }
})



export function extractToken(request:Request) : string | null {
  let access_token : string | null = String(
    request.header('access_token') ||
    request.header('Authorization') ||
    request.query.access_token ||
    request.query.accessToken
  ) || null;

  return access_token
}