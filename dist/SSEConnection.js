"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSEConnection = void 0;
const EventGenerator_1 = require("./EventGenerator");
const ScopeFilter_1 = require("./ScopeFilter");
class SSEConnection {
    constructor(accessToken, request, response, accessModel, uuid, cleanCallback) {
        this.scopeFilter = {};
        this.count = 0;
        this.accessToken = accessToken;
        this.accessModel = accessModel;
        this.request = request;
        this.response = response;
        this.cleanCallback = cleanCallback;
        this.uuid = uuid;
        this.expirationDate = new Date(accessModel.createdAt).valueOf() + 1000 * accessModel.ttl;
        // A HTTP connection times out after 2 minutes. To avoid this, we send keep alive messages every 30 seconds
        this.keepAliveTimer = setInterval(() => {
            // since we start this message with a colon (:), the client will not see it as a message.
            this.response.write(':ping\n\n');
            let pingEvent = { type: "ping", counter: this.count++ };
            this._transmit("data:" + JSON.stringify(pingEvent) + "\n\n");
            // if we are going to use the compression lib for express, we need to flush after a write.
            this.response.flushHeaders();
        }, 30000);
        if (this._checkIfTokenIsExpired()) {
            this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "TOKEN_EXPIRED", "Token Expired."));
            return;
        }
        // generate a filter based on the scope permissions.
        this.generateFilterFromScope();
        this.request.once('close', () => {
            this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(408, "STREAM_CLOSED", "Event stream has been closed."));
        });
    }
    generateFilterFromScope() {
        this.scopeFilter = ScopeFilter_1.generateFilterFromScope(this.accessModel.scopes, this.accessModel.userId);
    }
    destroy(message = "") {
        clearInterval(this.keepAliveTimer);
        this.response.end(message);
        this.cleanCallback();
    }
    dispatch(dataStringified, eventData) {
        if (this._checkIfTokenIsExpired()) {
            return this.destroy(EventGenerator_1.EventGenerator.getErrorEvent(401, "TOKEN_EXPIRED", "Token Expired."));
        }
        if (this.checkScopePermissions(eventData)) {
            this._transmit("data:" + dataStringified + "\n\n");
        }
    }
    checkScopePermissions(eventData) {
        if (this.scopeFilter === true) {
            return true;
        }
        let typeFilter = this.scopeFilter[eventData.type];
        if (typeFilter) {
            if (typeFilter["*"] !== undefined) {
                return typeFilter["*"](eventData);
            }
            else {
                let subType = "";
                if ("subType" in eventData) {
                    subType = eventData.subType;
                }
                else if ("operation" in eventData) {
                    subType = eventData.operation;
                }
                if (typeFilter[subType] !== undefined) {
                    return typeFilter[subType](eventData);
                }
            }
        }
        return false;
    }
    _transmit(data) {
        this.response.write(data);
        // if we are going to use the compression lib for express, we need to flush after a write.
        this.response.flushHeaders();
    }
    _checkIfTokenIsExpired() {
        return new Date().valueOf() >= this.expirationDate;
    }
}
exports.SSEConnection = SSEConnection;
//# sourceMappingURL=SSEConnection.js.map