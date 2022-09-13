export const getMockedRequest = function(input = {}) {
  return {
    once: jest.fn(),
    removeAllListeners: jest.fn(),
    ...input
  }
}

export const getMockedResponse = function(input = {}) {
  return {
    end: jest.fn(),
    write: jest.fn(),
    flushHeaders: jest.fn(),
    ...input
  }
}


export const getAccessModel = function(sphereId: string, userId, scopes: oauthScope[]) : AccessModel {
  let spheres = {}
  spheres[sphereId] = true;
  return {
    accessToken: "myAccessToken",
    ttl: 1e5,
    createdAt: new Date().valueOf(),
    userId: userId,
    spheres: spheres,
    scopes: scopes
  }
}
