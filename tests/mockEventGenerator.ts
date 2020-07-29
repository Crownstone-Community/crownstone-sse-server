
export function getPingEvent(counter) {
  return {
    type:    "ping",
    counter:  counter,
  }
}

let systemSubTypes = ["TOKEN_EXPIRED", "NO_ACCESS_TOKEN", "NO_CONNECTION", "STREAM_START", "STREAM_CLOSED"];
export function getSystemEvent(subtype = systemSubTypes[0], code = 10, message = "Testing") {
  return {
    type:    "system",
    subType:  subtype,
    code:     code,
    message:  message,
  }
}

export function getSwitchCrownstoneEvent(sphereId) {
  return {
    type:        "command",
    subType:     "switchCrownstone",
    sphere:      getSphereData(sphereId),
    crownstone:  getCrownstoneData(),
  }
}

export function getMultiSwitchCrownstoneEvent(sphereId) {
  return { // not used yet
    type:        "command",
    subType:     "multiSwitch",
    sphere:      getSphereData(sphereId),
    switchData:  [getCrownstoneData(), getCrownstoneData()],
  }
}

let presenceSubTypes = ["enterSphere", "exitSphere"];
export function getPresenceSphereEvent(sphereId, userId, subtype = presenceSubTypes[0]) {
  return {
    type:     "presence",
    subType:  subtype,
    user:     getUserData(userId),
    sphere:   getSphereData(sphereId)
  }
}

let presenceLocationSubTypes = ["enterLocation", "exitLocation"];
export function getPresenceLocationEvent(sphereId, userId, subtype = presenceLocationSubTypes[0]) {
  return {
    type:     "presence",
    subType:  subtype,
    user:     getUserData(userId),
    sphere:   getSphereData(sphereId),
    location: getLocationData(),
  }
}


let dataChangeSubtype = ["users"  , "spheres", "stones", "locations"];
let dataChangeOperation = ["create" , "delete" , "update"];
export function getDataChangeEvent(sphereId, userId, subtype = dataChangeSubtype[0], operation = dataChangeOperation[0]) {
  return {
    type:        "dataChange",
    subType:     subtype,
    operation:   operation,
    sphere:      getSphereData(sphereId),
    changedItem: getNameIdSet(userId),
  }
}

export function getSphereTokensUpdatedEvent(sphereId) {
  return {
    type:        "sphereTokensChanged",
    subType:     "sphereAuthorizationTokens",
    operation:   "update",
    sphere:      getSphereData(sphereId),
  }
}

let abilityChangeSubtypes = ["dimming"  , "switchcraft", "tapToToggle"];
export function getAbilityChangeEvent(sphereId, subtype = abilityChangeSubtypes[0]) {
  return {
    type:        "abilityChange",
    subType:     subtype,
    sphere:      getSphereData(sphereId),
    stone:       getCrownstoneData(),
    ability:     getAbilityData()
  }
}

let invitationOperations = ["invited", "invitationRevoked"]
export function getInvitationChangeEvent(sphereId, operation = invitationOperations[0]) {
  return {
    type:        "invitationChange",
    operation:   operation,
    sphere:      getSphereData(sphereId),
    email:       "unit@test.com",
  }
}
export function getSwitchStateUpdateEvent(sphereId) {
  return {
    type:        'switchStateUpdate',
    subType:     'stone',
    sphere:       getSphereData(sphereId),
    crownstone:   getCrownstoneData(),
  }
}

export function getNameIdSet(id = null) {
  return {
    id:   id || "string",
    name: "string"
  }
}
export function getSphereData(sphereId, uid = null) {
  return {
    ...getNameIdSet(sphereId),
    uid: uid || 4
  }
}

export function getUserData(id) { return getNameIdSet(id) }
export function getLocationData()  { return getNameIdSet() }
export function getCrownstoneData() {
  return {
    ...getNameIdSet(),
    switchState: 2, // 0 .. 1
    macAddress: "ab:ce:da:ca:e3",
    uid: 2,
  }
}

let crownstoneSwitchDateTypes = ["TURN_ON", "TURN_OFF", "DIMMING"]
export function getCrownstoneSwitchData(type) {
  return {
    ...getCrownstoneData(),
    type: crownstoneSwitchDateTypes[0] || type
  }
}

export function getAbilityData() {
  return {
    type: "test",
    enabled: true,
    syncedToCrownstone: true,
  }
}

export function getAllDataEvents(sphereId, userId) {
  let dataChangeOptions = [];
  dataChangeSubtype.forEach((s) => {
    dataChangeOperation.forEach((o) => {
      dataChangeOptions.push(getDataChangeEvent(sphereId, userId, s, o))
    })
  })

  return [
    getSwitchStateUpdateEvent(sphereId),
    getSwitchCrownstoneEvent(sphereId),
    getMultiSwitchCrownstoneEvent(sphereId),
    getSphereTokensUpdatedEvent(sphereId),
    ...presenceSubTypes.map(        (s) => getPresenceSphereEvent(sphereId, userId, s)),
    ...presenceLocationSubTypes.map((s) => getPresenceLocationEvent(sphereId, userId, s)),
    ...abilityChangeSubtypes.map(   (s) => getAbilityChangeEvent(sphereId, s)),
    ...dataChangeOptions,
    getInvitationChangeEvent(sphereId),
  ]
}