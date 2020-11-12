import {EventDispatcherClass} from "../src/EventDispatcher";
import {getMockedRequest, getMockedResponse} from "./mocks";



test("Connect a client with an expired token", () => {
  let dispatcher = new EventDispatcherClass()

  let accessModel = {
    accessToken: "myAccessToken",
    ttl: 100, // seconds
    createdAt: new Date().valueOf() - 1e6,
    userId: "userId",
    spheres: {
      "mySphere": true
    },
    scopes: "all"
  };

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req,res, accessModel);
  expect(Object.keys(dispatcher.clients).length).toBe(0)

})

