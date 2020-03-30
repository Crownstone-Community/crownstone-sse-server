"use strict";
/// <reference path="./declarations/declarations.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const EventGenerator_1 = require("./EventGenerator");
const EventDispatcher_1 = require("./EventDispatcher");
const SocketManager_1 = require("./socket/SocketManager");
const helmet = require('helmet');
const express = require('express');
const app = express();
const port = 8000;
SocketManager_1.SocketManager.setupConnection();
app.listen(process.env.PORT || port, () => {
    let baseUrl = process.env.BASE_URL || ("localhost:" + port);
    if (baseUrl.indexOf("http://") === -1 && baseUrl.indexOf("https://") === -1) {
        baseUrl = 'https://' + baseUrl;
    }
    console.log('Web server listening at: %s', baseUrl);
});
app.use("/", express.static('public'));
app.use(helmet());
app.get('/sse', function (req, res) {
    res.writeHead(200, {
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no'
    });
    const accessToken = req.query.accessToken;
    if (!accessToken) {
        res.end(EventGenerator_1.EventGenerator.getErrorEvent(400, "NO_ACCESS_TOKEN", "No accessToken provided..."));
    }
    if (SocketManager_1.SocketManager.isConnected() === false) {
        res.end(EventGenerator_1.EventGenerator.getErrorEvent(500, "NO_CONNECTION", "Not connected to cloud service. Try again later..."));
    }
    let validationPromise;
    if (accessToken.length > 32) {
        validationPromise = SocketManager_1.SocketManager.isValidAccessToken(accessToken);
    }
    else {
        validationPromise = SocketManager_1.SocketManager.isValidOauthToken(accessToken);
    }
    validationPromise
        .then((validationResult) => {
        if (validationResult === false) {
            return res.end(EventGenerator_1.EventGenerator.getErrorEvent(400, "NO_ACCESS_TOKEN", "No valid accessToken provided..."));
        }
        else {
            res.write(EventGenerator_1.EventGenerator.getStartEvent());
            EventDispatcher_1.EventDispatcher.addClient(accessToken, req, res, validationResult);
        }
    })
        .catch((err) => {
        console.log("err", err);
        res.end(err);
    });
});
//# sourceMappingURL=Server.js.map