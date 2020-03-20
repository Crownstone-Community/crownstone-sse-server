import { Request, Response } from "express-serve-static-core";
export declare class SSEConnection {
    accessToken: any;
    accessModel: AccessModel;
    queryFilter: {};
    request: Request;
    response: Response;
    keepAliveTimer: any;
    expirationDate: any;
    cleanCallback: () => void;
    constructor(accessToken: string, request: Request, response: Response, accessModel: AccessModel, cleanCallback: () => void);
    destroy(message?: string): void;
    dispatch(dataStringified: string, data: any): void;
    transmit(data: string): void;
    _checkIfTokenIsExpired(): boolean;
}
