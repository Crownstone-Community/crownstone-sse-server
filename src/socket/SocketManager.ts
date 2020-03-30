import io from "socket.io-client"
import crypto from "crypto"
import {EventDispatcher} from "../EventDispatcher";

const RETRY_TIMEOUT = 5000; // ms

const protocolTopics = {
  requestForOauthTokenCheck:  "requestForOauthTokenCheck",
  requestForAccessTokenCheck: "requestForAccessTokenCheck",
  authenticationRequest: "authenticationRequest",
  event: "event",
}

const errors = {
  couldNotVerifyToken: 'couldNotVerifyToken',
  invalidToken: 'invalidToken',
  invalidResponse: 'invalidResponse',
}

class SocketManagerClass {
  socket = null;
  reconnectAfterCloseTimeout = null;
  reconnectCounter = 0;

  constructor() {

  }

  setupConnection() {
    console.log("Connecting to ", process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"])
    this.socket = io(process.env["CROWNSTONE_CLOUD_SOCKET_ENDPOINT"], { transports: ['websocket'], autoConnect: true});

    this.socket.on("connect",             () => { console.log("Connected to Crownstone SSE Server host.") })
    this.socket.on("reconnect_attempt",   () => {
      this.reconnectCounter += 1;
      clearTimeout( this.reconnectAfterCloseTimeout );
    })

    this.socket.on(protocolTopics.authenticationRequest, (data, callback) => {
      let hasher = crypto.createHash('sha256');
      let output = hasher.update(data + process.env["CROWNSTONE_CLOUD_SSE_TOKEN"]).digest('hex');
      callback(output)

      this.socket.removeAllListeners("event");
      this.socket.on(protocolTopics.event, (data) => { EventDispatcher.dispatch(data); });
    });

    this.socket.on('disconnect', () => {
      this.reconnectAfterCloseTimeout = setTimeout(() => {
        this.socket.removeAllListeners()
        // on disconnect, all events are destroyed so we can just re-initialize.
        // under normal circumstances, the reconnect would take over and it will clear this timeout.
        // This is just in case of a full, serverside, disconnect.
        this.setupConnection();
      }, RETRY_TIMEOUT );
    });
  }

  isConnected() {
    return this.socket.connected;
  }

  _isValidToken(token, requestType) : Promise<AccessModel | false> {
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
        if (responseValid === false) { return; }


        if (reply?.code !== 200) {
          reject(errors.invalidToken);
        }
        else if (reply?.data) {
          resolve(reply?.data);
        }
        else {
          reject(errors.invalidResponse);
        }
      })
    })
  }

  isValidAccessToken(token: string) : Promise<AccessModel | false>{
    return this._isValidToken(token, protocolTopics.requestForAccessTokenCheck);
  }

  isValidOauthToken(token: string) : Promise<AccessModel | false>{
    return this._isValidToken(token, protocolTopics.requestForOauthTokenCheck);
  }

}

export const SocketManager = new SocketManagerClass();
