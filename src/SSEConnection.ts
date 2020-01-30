import {Request, Response} from "express-serve-static-core";
import {EventGenerator} from "./EventGenerator";


export class SSEConnection {

  accessToken = null;
  accessModel : AccessModel = null;
  queryFilter = {};
  request : Request = null;
  response : Response = null;

  expirationDate = null;

  cleanCallback : () => void = null;

  constructor(accessToken : string, request: Request, response : Response, accessModel: AccessModel, cleanCallback: () => void) {
    this.accessToken = accessToken;
    this.accessModel = accessModel;
    this.request     = request;
    this.response    = response;
    this.cleanCallback = cleanCallback;

    this.expirationDate = new Date(accessModel.createdAt).valueOf() + 1000*accessModel.ttl;

    if (this._checkIfTokenIsExpired()) {
      this.destroy(EventGenerator.getErrorEvent(401, "Token Expired."));
      return;
    }

    this.request.once('close', () => { this.destroy(); });
  }

  destroy(message = "") {
    this.response.end(message);
    this.cleanCallback()
  }

  dispatch(dataStringified: string, data) {
    if (this._checkIfTokenIsExpired()) {
      return this.destroy(EventGenerator.getErrorEvent(401, "Token Expired."));
    }

    this.transmit(dataStringified);
  }

  transmit(data : string) {
    this.response.write(data);
  }


  _checkIfTokenIsExpired() : boolean {
    return new Date().valueOf() >= this.expirationDate;
  }
}