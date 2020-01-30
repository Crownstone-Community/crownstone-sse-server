import {Request, Response} from "express-serve-static-core";
import {Util} from "./util/util";
import {SSEConnection} from "./SSEConnection";

interface ClientMap {
  [key: string] : SSEConnection
}

class EventDispatcherClass {

  clients : ClientMap = {};
  listOfStreams = [];
  routingMap : RoutingMap = null;

  constructor() {
    this._clearRoutingMap();
  }

  /**
   * This is where the data is pushed from the socket connection with the Crownstone cloud.
   * From here it should be distributed to the enduser.
   * @param data
   */
  dispatch(data) {
    let sphereId = data?.sphere?.id;
    let clientIdArray = this.routingMap.all[sphereId];

    if (sphereId && clientIdArray && clientIdArray.length > 0) {
      let perparedData = JSON.stringify(data);
      for (let i = 0; i < clientIdArray.length; i++) {
        this.clients[clientIdArray[i]].dispatch(perparedData, data)
      }
    }
  }

  addClient(accessToken: string, request : Request, response: Response, accessModel: AccessModel) {
    let uuid = Util.getUUID();
    this.clients[uuid] = new SSEConnection(
      accessToken,
      request,
      response,
      accessModel,
      () => { delete this.clients[uuid]; this._refreshLists(); }
    );
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

export const EventDispatcher = new EventDispatcherClass();
