declare class SocketManagerClass {
    socket: any;
    reconnectAfterCloseTimeout: any;
    reconnectCounter: number;
    constructor();
    setupConnection(): void;
    isConnected(): any;
    _isValidToken(token: any, requestType: any): Promise<AccessModel | false>;
    isValidAccessToken(token: string): Promise<AccessModel | false>;
    isValidOauthToken(token: string): Promise<AccessModel | false>;
}
export declare const SocketManager: SocketManagerClass;
export {};
