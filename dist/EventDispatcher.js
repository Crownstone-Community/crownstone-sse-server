"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util/util");
const SSEConnection_1 = require("./SSEConnection");
class EventDispatcherClass {
    constructor() {
        this.clients = {};
        this.listOfStreams = [];
        this.routingMap = null;
        this._clearRoutingMap();
    }
    /**
     * This is where the data is pushed from the socket connection with the Crownstone cloud.
     * From here it should be distributed to the enduser.
     * @param data
     */
    dispatch(data) {
        var _a, _b;
        let sphereId = (_b = (_a = data) === null || _a === void 0 ? void 0 : _a.sphere) === null || _b === void 0 ? void 0 : _b.id;
        let clientIdArray = this.routingMap.all[sphereId];
        if (sphereId && clientIdArray && clientIdArray.length > 0) {
            let perparedData = JSON.stringify(data);
            for (let i = 0; i < clientIdArray.length; i++) {
                this.clients[clientIdArray[i]].dispatch(perparedData, data);
            }
        }
    }
    addClient(accessToken, request, response, accessModel) {
        let uuid = util_1.Util.getUUID();
        this.clients[uuid] = new SSEConnection_1.SSEConnection(accessToken, request, response, accessModel, () => { delete this.clients[uuid]; this._refreshLists(); });
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
}
exports.EventDispatcher = new EventDispatcherClass();
//# sourceMappingURL=EventDispatcher.js.map