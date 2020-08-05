"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = exports.EventDispatcherClass = void 0;
const util_1 = require("./util/util");
const SSEConnection_1 = require("./SSEConnection");
const EventGenerator_1 = require("./EventGenerator");
class EventDispatcherClass {
    constructor() {
        this.clients = {};
        this._clearRoutingMap();
    }
    /**
     * This is where the data is pushed from the socket connection with the Crownstone cloud.
     * From here it should be distributed to the enduser.
     * @param eventData
     */
    dispatch(eventData) {
        var _a;
        let sphereId = (_a = eventData === null || eventData === void 0 ? void 0 : eventData.sphere) === null || _a === void 0 ? void 0 : _a.id;
        let clientIdArray = this.routingMap.all[sphereId];
        if (sphereId && clientIdArray && clientIdArray.length > 0) {
            let preparedEventString = JSON.stringify(eventData);
            for (let i = 0; i < clientIdArray.length; i++) {
                this.clients[clientIdArray[i]].dispatch(preparedEventString, eventData);
            }
        }
    }
    addClient(accessToken, request, response, accessModel) {
        let uuid = util_1.Util.getUUID();
        this.clients[uuid] = new SSEConnection_1.SSEConnection(accessToken, request, response, accessModel, uuid, () => { delete this.clients[uuid]; this._refreshLists(); });
        this._refreshLists();
    }
    _clearRoutingMap() {
        this.routingMap = {
            all: {},
            presence: {},
            command: {},
        };
    }
    _refreshLists() {
        this._clearRoutingMap();
        // allocate variables for use in loops.
        let clientId = null;
        let client = null;
        let sphereId = null;
        let clientIds = Object.keys(this.clients);
        for (let i = 0; i < clientIds.length; i++) {
            clientId = clientIds[i];
            client = this.clients[clientIds[i]];
            let sphereIdsInClient = Object.keys(client.accessModel.spheres);
            for (let j = 0; j < sphereIdsInClient.length; j++) {
                sphereId = sphereIdsInClient[j];
                if (this.routingMap.all[sphereId] === undefined) {
                    this.routingMap.all[sphereId] = [];
                }
                this.routingMap.all[sphereIdsInClient[j]].push(clientIds[i]);
            }
        }
    }
    destroy() {
        Object.keys(this.clients).forEach((clientId) => {
            this.clients[clientId].destroy(EventGenerator_1.EventGenerator.getErrorEvent(500, "STREAM_CLOSED", "Server stopping. Try again later."));
        });
        this._clearRoutingMap();
    }
}
exports.EventDispatcherClass = EventDispatcherClass;
exports.EventDispatcher = new EventDispatcherClass();
//# sourceMappingURL=EventDispatcher.js.map