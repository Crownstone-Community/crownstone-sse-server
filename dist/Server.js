"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractToken = void 0;
const EventGenerator_1 = require("./EventGenerator");
const EventDispatcher_1 = require("./EventDispatcher");
const SocketManagers_1 = require("./socket/SocketManagers");
const helmet = require('helmet');
const express = require('express');
const app = express();
const port = 8000;
if (process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"]) {
    SocketManagers_1.SocketManager.setCallback(EventDispatcher_1.EventDispatcher.dispatch.bind(EventDispatcher_1.EventDispatcher));
    // SocketManager.setupConnection(process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"] as string);
}
if (process.env["CROWNSTONE_CLOUD_NEXT_SOCKET_ENDPOINT"]) {
    SocketManagers_1.SocketManager_next.setCallback(EventDispatcher_1.EventDispatcher.dispatch.bind(EventDispatcher_1.EventDispatcher));
    SocketManagers_1.SocketManager_next.setupConnection(process.env["CROWNSTONE_CLOUD_NEXT_SOCKET_ENDPOINT"]);
}
app.listen(process.env.PORT || port, () => {
    let baseUrl = process.env.BASE_URL || ("localhost:" + port);
    if (baseUrl.indexOf("http://") === -1 && baseUrl.indexOf("https://") === -1) {
        baseUrl = 'https://' + baseUrl;
    }
    console.log('Web server listening at: %s', baseUrl);
});
app.use("/", express.static('public'));
app.use(helmet());
app.get('/debug', function (req, res) {
    let validationToken = process.env.DEBUG_TOKEN || "debug";
    if (req.query.token === validationToken) {
        let debugInformation = {
            connected: SocketManagers_1.SocketManager.isConnected(),
            connectedNext: SocketManagers_1.SocketManager_next.isConnected(),
            amountOfConnections: Object.keys(EventDispatcher_1.EventDispatcher.clients).length
        };
        res.end(JSON.stringify(debugInformation));
    }
    else {
        res.end("Invalid token.");
    }
});
app.get('/sse', function (req, res) {
    const accessToken = extractToken(req);
    if (!accessToken) {
        console.warn("Request received without access token!");
        res.end(EventGenerator_1.EventGenerator.getErrorEvent(400, "NO_ACCESS_TOKEN", "No accessToken provided..."));
        return;
    }
    connectWithCloud(SocketManagers_1.SocketManager, req, res, accessToken);
    connectWithCloud(SocketManagers_1.SocketManager_next, req, res, accessToken);
});
function connectWithCloud(socketManager, req, res, accessToken) {
    let cancelled = false;
    req.once('close', () => { cancelled = true; });
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    });
    if (SocketManagers_1.SocketManager.isConnected() === false) {
        console.warn("Attempted to connect to the SSE while it wasnt connected to the cloud.");
        res.end(EventGenerator_1.EventGenerator.getErrorEvent(500, "NO_CONNECTION", "Not connected to cloud service. Try again later..."));
        return;
    }
    SocketManagers_1.SocketManager.isValidToken(accessToken)
        .then((validationResult) => {
        // if the connection is cancelled before it is validated, do not start the connection
        if (cancelled) {
            console.warn("Cancelled request after validation.");
            return res.end();
        }
        if (validationResult === false) {
            console.warn("Request received without VALID access token!");
            return res.end(EventGenerator_1.EventGenerator.getErrorEvent(400, "NO_ACCESS_TOKEN", "No valid accessToken provided..."));
        }
        else {
            res.write(EventGenerator_1.EventGenerator.getStartEvent());
            EventDispatcher_1.EventDispatcher.addClient(accessToken, req, res, validationResult);
        }
    })
        .catch((err) => {
        console.log("Error in SocketManager.isValidToken", err);
        res.end(err);
    });
}
function extractToken(request) {
    let access_token = String(request.header('access_token') ||
        request.header('Authorization') ||
        request.query.access_token ||
        request.query.accessToken) || null;
    return access_token;
}
exports.extractToken = extractToken;
//# sourceMappingURL=Server.js.map