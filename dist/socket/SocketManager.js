"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const crypto_1 = __importDefault(require("crypto"));
const EventDispatcher_1 = require("../EventDispatcher");
const RETRY_TIMEOUT = 5000; // ms
const protocolTopics = {
    requestForOauthTokenCheck: "requestForOauthTokenCheck",
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
        this.socket.on("connect", () => { console.log("Connected to Crownstone SSE Server host."); });
        this.socket.on("reconnect_attempt", () => {
            this.reconnectCounter += 1;
            clearTimeout(this.reconnectAfterCloseTimeout);
        });
        this.socket.on(protocolTopics.authenticationRequest, (data, callback) => {
            let hasher = crypto_1.default.createHash('sha256');
            let output = hasher.update(data + process.env["CROWNSTONE_CLOUD_SSE_TOKEN"]).digest('hex');
            callback(output);
            this.socket.removeAllListeners("event");
            this.socket.on(protocolTopics.event, (data) => { EventDispatcher_1.EventDispatcher.dispatch(data); });
        });
        this.socket.on('disconnect', () => {
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
    _isValidToken(token, requestType) {
        return new Promise((resolve, reject) => {
            // in case we can not get the token resolved in time, timeout.
            let responseValid = true;
            let tokenValidityCheckTimeout = setTimeout(() => {
                responseValid = false;
                reject(errors.couldNotVerifyToken);
            }, 3000);
            // request the token to be checked, and a accessmodel returned
            this.socket.emit(requestType, token, (reply) => {
                clearTimeout(tokenValidityCheckTimeout);
                // if we have already timed out, ignore any response.
                if (responseValid === false) {
                    return;
                }
                if ((reply === null || reply === void 0 ? void 0 : reply.code) !== 200) {
                    reject(errors.invalidToken);
                }
                else if (reply === null || reply === void 0 ? void 0 : reply.data) {
                    resolve(reply === null || reply === void 0 ? void 0 : reply.data);
                }
                else {
                    reject(errors.invalidResponse);
                }
            });
        });
    }
    isValidAccessToken(token) {
        return this._isValidToken(token, protocolTopics.requestForAccessTokenCheck);
    }
    isValidOauthToken(token) {
        return this._isValidToken(token, protocolTopics.requestForOauthTokenCheck);
    }
}
exports.SocketManager = new SocketManagerClass();
//# sourceMappingURL=SocketManager.js.map