"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const crypto_1 = __importDefault(require("crypto"));
const EventDispatcher_1 = require("../EventDispatcher");
const RETRY_TIMEOUT = 5000; // ms
const protocolTopics = {
    requestForAccessTokenCheck: "requestForAccessTokenCheck",
    authenticationRequest: "authenticationRequest",
    event: "event",
};
const errors = {
    couldNotVerifyToken: 'couldNotVerifyToken',
    invalidToken: 'invalidToken',
    invalidResponse: 'invalidResponse',
};
class SocketManagerClass {
    constructor() {
        this.socket = null;
        this.reconnectAfterCloseTimeout = null;
        this.reconnectCounter = 0;
    }
    setupConnection() {
        console.log("Connecting to ", process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"]);
        this.socket = socket_io_client_1.default(process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"], { transports: ['websocket'], autoConnect: true });
        this.socket.on("connect", () => { console.log("connected"); });
        this.socket.on("reconnect_attempt", () => {
            this.reconnectCounter += 1;
            clearTimeout(this.reconnectAfterCloseTimeout);
            console.log("reconnect_attempt", this.reconnectCounter);
        });
        this.socket.on(protocolTopics.authenticationRequest, (data, callback) => {
            let hasher = crypto_1.default.createHash('sha256');
            let output = hasher.update(data + process.env["CROWNSTONE_CLOUD_SSE_TOKEN"]).digest('hex');
            callback(output);
            this.socket.removeAllListeners("event");
            this.socket.on(protocolTopics.event, (data) => { EventDispatcher_1.EventDispatcher.dispatch(data); });
        });
        this.socket.on('disconnect', () => {
            console.log("Disconnect");
            this.reconnectAfterCloseTimeout = setTimeout(() => {
                this.socket.removeAllListeners();
                // on disconnect, all events are destroyed so we can just re-initialize.
                // under normal circumstances, the reconnect would take over and it will clear this timeout.
                // This is just in case of a full, serverside, disconnect.
                this.setupConnection();
            }, RETRY_TIMEOUT);
        });
    }
    isConnected() {
        return this.socket.connected;
    }
    isValidAccessToken(token) {
        return new Promise((resolve, reject) => {
            // in case we can not get the token resolved in time, timeout.
            let responseValid = true;
            let tokenValidityCheckTimeout = setTimeout(() => {
                responseValid = false;
                reject(errors.couldNotVerifyToken);
            }, 3000);
            // request the token to be checked, and a accessmodel returned
            this.socket.emit(protocolTopics.requestForAccessTokenCheck, token, (reply) => {
                var _a, _b, _c;
                clearTimeout(tokenValidityCheckTimeout);
                // if we have already timed out, ignore any response.
                if (responseValid === false) {
                    return;
                }
                if (((_a = reply) === null || _a === void 0 ? void 0 : _a.code) !== 200) {
                    reject(errors.invalidToken);
                }
                else if ((_b = reply) === null || _b === void 0 ? void 0 : _b.data) {
                    resolve((_c = reply) === null || _c === void 0 ? void 0 : _c.data);
                }
                else {
                    reject(errors.invalidResponse);
                }
            });
        });
    }
}
exports.SocketManager = new SocketManagerClass();
//# sourceMappingURL=SocketManager.js.map