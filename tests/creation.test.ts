import {EventDispatcherClass} from "../src/EventDispatcher";
import {getMockedRequest, getMockedResponse} from "./mocks";



test("Connect a client", () => {
  let dispatcher = new EventDispatcherClass()

  let accessModel = {
    accessToken: "myAccessToken",
    ttl: 1e5,
    createdAt: new Date().valueOf(),
    userId: "userId",
    spheres: {
      "mySphere": true
    },
    scopes: "all"
  }

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req,res, accessModel);
  expect(Object.keys(dispatcher.clients).length).toBe(1)

  let client = dispatcher.clients[Object.keys(dispatcher.clients)[0]]

  client.destroy()
  expect(Object.keys(dispatcher.clients).length).toBe(0)
  expect(res.end).toHaveBeenCalledWith('');
})

