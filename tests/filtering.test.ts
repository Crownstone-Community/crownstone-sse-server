import {EventDispatcherClass} from "../src/EventDispatcher";
import {getAccessModel, getMockedRequest, getMockedResponse} from "./mocks";
import {getAllDataEvents} from "./mockEventGenerator";

let userId = "userId";
let sphereId = "sphereId";

test("test *all* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['all'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) })
  expect(res.write).toHaveBeenCalledTimes(allEvents.length)

  let otherSphereEvents = getAllDataEvents("otherSphere", userId);
  otherSphereEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(allEvents.length);

  dispatcher.destroy();
})

test("test *user_location* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['user_location'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(4);

  let otherSphereEvents = getAllDataEvents("otherSphere", userId);
  otherSphereEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(4);

  let otherUserEvents = getAllDataEvents(sphereId, 'otherUser');
  otherUserEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(4);

  dispatcher.destroy();
})



test("test *stone_information* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['stone_information'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(7);

  let otherSphereEvents = getAllDataEvents("otherSphere", userId);
  otherSphereEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(7);

  dispatcher.destroy();
})



test("test *sphere_information* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['sphere_information'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(9);

  dispatcher.destroy();
})


test("test *switch_stone* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['switch_stone'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(2);

  dispatcher.destroy();
})

test("test *location_information* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['location_information'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(3);

  dispatcher.destroy();
})

test("test *user_information* scopes", () => {
  let dispatcher = new EventDispatcherClass()
  let accessModel = getAccessModel(sphereId, userId, ['user_information'])

  let req = getMockedRequest()
  let res = getMockedResponse()

  // @ts-ignore
  dispatcher.addClient("myAccessToken", req, res, accessModel);

  let allEvents = getAllDataEvents(sphereId, userId);
  allEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(3);

  let otherUserEvents = getAllDataEvents(sphereId, 'otherUser');
  otherUserEvents.forEach((e) => { dispatcher.dispatch(e) });
  expect(res.write).toHaveBeenCalledTimes(3);

  dispatcher.destroy();
})
