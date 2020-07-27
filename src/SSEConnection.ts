import {Request, Response} from "express-serve-static-core";
import {EventGenerator} from "./EventGenerator";

interface ScopeFilter {
  [key: string]: {
    [key: string] : (any) => boolean
  }
}

export class SSEConnection {

  accessToken = null;
  accessModel : AccessModel = null;
  queryFilter = {};
  scopeFilter : ScopeFilter | true = {};
  request : Request = null;
  response : Response = null;
  keepAliveTimer = null;
  count = 0

  expirationDate = null;
  uuid = null;

  cleanCallback : () => void = null;

  constructor(accessToken : string, request: Request, response : Response, accessModel: AccessModel, uuid: string, cleanCallback: () => void) {
    this.accessToken   = accessToken;
    this.accessModel   = accessModel;
    this.request       = request;
    this.response      = response;
    this.cleanCallback = cleanCallback;
    this.uuid          = uuid;

    this.expirationDate = new Date(accessModel.createdAt).valueOf() + 1000*accessModel.ttl;

    // A HTTP connection times out after 2 minutes. To avoid this, we send keep alive messages every 30 seconds
    this.keepAliveTimer = setInterval(() => {
      // since we start this message with a colon (:), the client will not see it as a message.
      this.response.write(':ping\n\n');

      let pingEvent = { type:"ping",counter: this.count++ }
      this._transmit("data:" + JSON.stringify(pingEvent) + "\n\n");

      // if we are going to use the compression lib for express, we need to flush after a write.
      this.response.flushHeaders()
    }, 30000);

    if (this._checkIfTokenIsExpired()) {
      this.destroy(EventGenerator.getErrorEvent(401, "TOKEN_EXPIRED", "Token Expired."));
      return;
    }

    // generate a filter based on the scope permissions.
    this.generateFilterFromScope();

    this.request.once('close', () => {
      this.destroy(EventGenerator.getErrorEvent(408, "STREAM_CLOSED", "Event stream has been closed."));
    });
  }

  generateFilterFromScope() {
    if (this.accessModel.scopes.indexOf("all") !== -1) {
      this.scopeFilter = true;
      return;
    }


    if (this.accessModel.scopes.indexOf("user_location") !== -1) {
      if (this.scopeFilter["presence"] === undefined) { this.scopeFilter["presence"] = {}; }
      this.scopeFilter["presence"]["all"] = (eventData) => { return eventData.user.id === this.accessModel.userId; };
    }


    if (this.accessModel.scopes.indexOf("stone_information") !== -1) {
      if (this.scopeFilter["dataChange"] === undefined) { this.scopeFilter["dataChange"] = {}; }
      this.scopeFilter["dataChange"]["stones"]       = () => true;
      this.scopeFilter["abilityChange"]["all"]       = () => true;
      this.scopeFilter["switchStateUpdate"]["stone"] = () => true;
    }


    if (this.accessModel.scopes.indexOf("sphere_information") !== -1) {
      if (this.scopeFilter["dataChange"] === undefined) { this.scopeFilter["dataChange"] = {}; }
      this.scopeFilter["dataChange"]["stones"]    = () => true;
      this.scopeFilter["dataChange"]["locations"] = () => true;
      this.scopeFilter["dataChange"]["spheres"]   = () => true;
    }


    if (this.accessModel.scopes.indexOf("switch_stone") !== -1) {
      if (this.scopeFilter["command"] === undefined) { this.scopeFilter["command"] = {}; }
      this.scopeFilter["command"]["switchCrownstone"] = () => true;
    }


    if (this.accessModel.scopes.indexOf("location_information") !== -1) {
      if (this.scopeFilter["dataChange"] === undefined) { this.scopeFilter["dataChange"] = {}; }
      this.scopeFilter["dataChange"]["locations"] = () => true;
    }


    if (this.accessModel.scopes.indexOf("user_information") !== -1) {
      this.scopeFilter["dataChange"]["users"] = (eventData) => { return eventData.user.id === this.accessModel.userId; }
    }


    // if (this.accessModel.scopes.indexOf("power_consumption") !== -1) {}
    // if (this.accessModel.scopes.indexOf("user_id")          !== -1) {}
  }

  destroy(message = "") {
    clearInterval(this.keepAliveTimer);
    this.response.end(message);
    this.cleanCallback()
  }

  dispatch(dataStringified: string, eventData: SseDataEvent) {
    if (this._checkIfTokenIsExpired()) {
      return this.destroy(EventGenerator.getErrorEvent(401, "TOKEN_EXPIRED", "Token Expired."));
    }

    if (this.checkScopePermissions(eventData)) {
      this._transmit("data:" + dataStringified + "\n\n");
    }
  }

  checkScopePermissions(eventData) : boolean {
    if (this.scopeFilter === true) {
      return true;
    }

    let typeFilter = this.scopeFilter[eventData.type];
    if (typeFilter) {
      if (typeFilter["all"] !== undefined) {
        return typeFilter["all"](eventData);
      }
      else {
        let subType = eventData.subType || eventData.operation;
        if (typeFilter[subType] !== undefined) {
          return typeFilter[subType](eventData);
        }
      }
    }

    return false;
  }

  _transmit(data : string) {
    this.response.write(data);
    // if we are going to use the compression lib for express, we need to flush after a write.
    this.response.flushHeaders()
  }


  _checkIfTokenIsExpired() : boolean {
    return new Date().valueOf() >= this.expirationDate;
  }
}