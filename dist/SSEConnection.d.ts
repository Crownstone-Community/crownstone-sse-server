import { Request, Response } from "express-serve-static-core";
interface ScopeFilter {
    [key: string]: {
        [key: string]: (any: any) => boolean;
    };
}
export declare class SSEConnection {
    accessToken: any;
    accessModel: AccessModel;
    scopeFilter: ScopeFilter | true;
    request: Request;
    response: Response;
    keepAliveTimer: any;
    count: number;
    expirationDate: any;
    uuid: any;
    cleanCallback: () => void;
    constructor(accessToken: string, request: Request, response: Response, accessModel: AccessModel, uuid: string, cleanCallback: () => void);
    generateFilterFromScope(): void;
    destroy(message?: string): void;
    dispatch(dataStringified: string, eventData: SseDataEvent): void;
    checkScopePermissions(eventData: any): boolean;
    _transmit(data: string): void;
    _checkIfTokenIsExpired(): boolean;
}
export {};
