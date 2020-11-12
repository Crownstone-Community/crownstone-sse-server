/// <reference types="socket.io-client" />
/// <reference types="node" />
import Timeout = NodeJS.Timeout;
import Socket = SocketIOClient.Socket;
declare class SocketManagerClass {
    socket: Socket;
    reconnectAfterCloseTimeout: Timeout | undefined;
    reconnectCounter: number;
    eventCallback: (arg0: SseDataEvent) => void;
    constructor(eventCallback?: (arg0: SseDataEvent) => void);
    setCallback(eventCallback: (arg0: SseDataEvent) => void): void;
    setupConnection(): void;
    isConnected(): boolean;
    _isValidToken(token: string, requestType: string): Promise<AccessModel | false>;
    isValidToken(token: string): Promise<AccessModel | false>;
    isValidAccessToken(token: string): Promise<AccessModel | false>;
    isValidOauthToken(token: string): Promise<AccessModel | false>;
}
export declare const SocketManager: SocketManagerClass;
export {};
