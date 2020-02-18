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
        this.keepAliveTimer = null;
        this.expirationDate = null;
        this.cleanCallback = null;
        this.accessToken = accessToken;
        this.accessModel = accessModel;
        this.request = request;
        this.response = response;
        this.cleanCallback = cleanCallback;
        this.expirationDate = new Date(accessModel.createdAt).valueOf() + 1000 * accessModel.ttl;
        // A HTTP connection times out after 2 minutes. To avoid this, we send keep alive messages every 30 seconds
        this.keepAliveTimer = setInterval(() => {
            // since we start this message with a colon (:), the client will not see it as a message.
            this.response.write(':ping\n\n');
            // if we are going to use the compression lib for express, we need to flush after a write.
            // this.response.flush()
        }, 30000);
        if (this._checkIfTokenIsExpired()) {
            this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "Token Expired."));
            return;
        }
        this.request.once('close', () => { this.destroy(); });
    }
    destroy(message = "") {
        clearInterval(this.keepAliveTimer);
        this.response.end(message);
        this.cleanCallback();
    }
    dispatch(dataStringified, data) {
        if (this._checkIfTokenIsExpired()) {
            return this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "Token Expired."));
        }
        this.transmit("data:" + dataStringified + "\n\n");
    }
    transmit(data) {
        this.response.write(data);
        // if we are going to use the compression lib for express, we need to flush after a write.
        // this.response.flush()
    }
    _checkIfTokenIsExpired() {
        return new Date().valueOf() >= this.expirationDate;
    }
}
exports.SSEConnection = SSEConnection;
//# sourceMappingURL=SSEConnection.js.map