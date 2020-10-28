"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const crypto_1 = __importDefault(require("crypto"));
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
    constructor(eventCallback = () => { }) {
        this.reconnectCounter = 0;
        this.eventCallback = eventCallback;
    }
    setCallback(eventCallback) {
        this.eventCallback = eventCallback;
    }
    setupConnection() {
        console.log("Connecting to ", process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"]);
        this.socket = socket_io_client_1.default(process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"], { transports: ['websocket'], autoConnect: true });
        this.socket.on("connect", () => { console.log("Connected to Crownstone SSE Server host."); });
        this.socket.on("reconnect_attempt", () => {
            console.log("Attempting to reconnect...");
            this.reconnectCounter += 1;
            if (this.reconnectAfterCloseTimeout) {
                clearTimeout(this.reconnectAfterCloseTimeout);
                this.reconnectAfterCloseTimeout = undefined;
            }
        });
        this.socket.on(protocolTopics.authenticationRequest, (data, callback) => {
            let hasher = crypto_1.default.createHash('sha256');
            let output = hasher.update(data + process.env["CROWNSTONE_CLOUD_SSE_TOKEN"]).digest('hex');
            callback(output);
            console.log("Authentication challenge completed.");
            this.socket.removeListener(protocolTopics.event);
            this.socket.on(protocolTopics.event, (data) => { this.eventCallback(data); });
        });
        this.socket.on('disconnect', () => {
            console.warn("disconnected...");
            if (this.reconnectAfterCloseTimeout) {
                clearTimeout(this.reconnectAfterCloseTimeout);
                this.reconnectAfterCloseTimeout = undefined;
            }
            this.reconnectAfterCloseTimeout = setTimeout(() => {
                console.log("Triggering reconnect...");
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
                this.socket.close();
                reject(errors.couldNotVerifyToken);
            }, 10000);
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
    isValidToken(token) {
        if (token.length > 32) {
            return this.isValidAccessToken(token);
        }
        else {
            return this.isValidOauthToken(token);
        }
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