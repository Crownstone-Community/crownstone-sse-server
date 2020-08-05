/// <reference types="node" />
import { Request, Response } from "express-serve-static-core";
import Timeout = NodeJS.Timeout;
export declare class SSEConnection {
    accessToken: string;
    accessModel: AccessModel;
    scopeFilter: ScopeFilter | true;
    request: Request;
    response: Response;
    keepAliveTimer: Timeout;
    count: number;
    expirationDate: number;
    uuid: string;
    cleanCallback: () => void;
    constructor(accessToken: string, request: Request, response: Response, accessModel: AccessModel, uuid: string, cleanCallback: () => void);
    generateFilterFromScope(): void;
    destroy(message?: string): void;
    dispatch(dataStringified: string, eventData: SseDataEvent): void;
    checkScopePermissions(eventData: SseDataEvent): boolean;
    _transmit(data: string): void;
    _checkIfTokenIsExpired(): boolean;
}
