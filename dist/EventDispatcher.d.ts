import { Request, Response } from "express-serve-static-core";
import { SSEConnection } from "./SSEConnection";
interface ClientMap {
    [key: string]: SSEConnection;
}
declare class EventDispatcherClass {
    clients: ClientMap;
    routingMap: RoutingMap;
    constructor();
    /**
     * This is where the data is pushed from the socket connection with the Crownstone cloud.
     * From here it should be distributed to the enduser.
     * @param eventData
     */
    dispatch(eventData: SseEvent): void;
    addClient(accessToken: string, request: Request, response: Response, accessModel: AccessModel): void;
    _clearRoutingMap(): void;
    _refreshLists(): void;
}
export declare const EventDispatcher: EventDispatcherClass;
export {};
