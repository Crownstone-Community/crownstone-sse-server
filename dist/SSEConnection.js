"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventGenerator_1 = require("./EventGenerator");
class SSEConnection {
    constructor(accessToken, request, response, accessModel, cleanCallback) {
        this.accessToken = null;
        this.accessModel = null;
        this.queryFilter = {};
        this.request = null;
        this.response = null;
        this.expirationDate = null;
        this.cleanCallback = null;
        this.accessToken = accessToken;
        this.accessModel = accessModel;
        this.request = request;
        this.response = response;
        this.cleanCallback = cleanCallback;
        this.expirationDate = new Date(accessModel.createdAt).valueOf() + 1000 * accessModel.ttl;
        if (this._checkIfTokenIsExpired()) {
            this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "Token Expired."));
            return;
        }
        this.request.once('close', () => { this.destroy(); });
    }
    destroy(message = "") {
        this.response.end(message);
        this.cleanCallback();
    }
    dispatch(dataStringified, data) {
        if (this._checkIfTokenIsExpired()) {
            return this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "Token Expired."));
        }
        this.transmit(dataStringified);
    }
    transmit(data) {
        this.response.write(data);
    }
    _checkIfTokenIsExpired() {
        return new Date().valueOf() >= this.expirationDate;
    }
}
exports.SSEConnection = SSEConnection;
//# sourceMappingURL=SSEConnection.js.map