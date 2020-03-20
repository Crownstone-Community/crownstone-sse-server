declare class SocketManagerClass {
    socket: any;
    reconnectAfterCloseTimeout: any;
    reconnectCounter: number;
    constructor();
    setupConnection(): void;
    isConnected(): any;
    isValidAccessToken(token: string): Promise<AccessModel | false>;
}
export declare const SocketManager: SocketManagerClass;
export {};
