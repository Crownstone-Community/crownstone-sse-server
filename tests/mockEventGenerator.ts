
export function getPingEvent(counter) {
  return {
    type:    "ping",
    counter:  counter,
  }
}

let systemSubTypes = ["TOKEN_EXPIRED", "INVALID_ACCESS_TOKEN", "NO_ACCESS_TOKEN", "NO_CONNECTION", "STREAM_START", "STREAM_CLOSED"];
export function getSystemEvent(subtype = systemSubTypes[0], code = 10, message = "Testing") {
  return {
    type:    "system",
    subType:  subtype,
    code:     code,
    message:  message,
  }
}

export function getMultiSwitchCrownstoneEvent(sphereId) : MultiSwitchCrownstoneEvent {
  return { // not used yet
    type:        "command",
    subType:     "multiSwitch",
    sphere:      getSphereData(sphereId),
    switchData:  [getCrownstoneSwitchCommand(), getCrownstoneSwitchCommand()] as any,
    sequenceTime: {timestamp: 100, counter: 2}
  }
}

let presenceSubTypes = ["enterSphere", "exitSphere"];
export function getPresenceSphereEvent(sphereId, userId, subtype = presenceSubTypes[0]) : PresenceSphereEvent {
  return {
    type:     "presence",
    subType:  subtype as any,
    user:     getUserData(userId),
    sphere:   getSphereData(sphereId)
  }
}

let presenceLocationSubTypes = ["enterLocation", "exitLocation"];
export function getPresenceLocationEvent(sphereId, userId, subtype = presenceLocationSubTypes[0]) : PresenceLocationEvent {
  return {
    type:     "presence",
    subType:  subtype as any,
    user:     getUserData(userId),
    sphere:   getSphereData(sphereId),
    location: getLocationData(),
  }
}


let dataChangeSubtype = ["users"  , "spheres", "stones", "locations"];
let dataChangeOperation = ["create" , "delete" , "update"];
export function getDataChangeEvent(sphereId, userId : string = null, subtype = dataChangeSubtype[0], operation = dataChangeOperation[0]) : DataChangeEvent {
  return {
    type:        "dataChange",
    subType:     subtype as any,
    operation:   operation as any,
    sphere:      getSphereData(sphereId),
    changedItem: getNameIdSet(userId),
  }
}

export function getSphereTokensUpdatedEvent(sphereId) : SphereTokensUpdatedEvent {
  return {
    type:        "sphereTokensChanged",
    subType:     "sphereAuthorizationTokens",
    operation:   "update",
    sphere:      getSphereData(sphereId),
  }
}

let abilityChangeSubtypes = ["dimming"  , "switchcraft", "tapToToggle"];
export function getAbilityChangeEvent(sphereId, subtype = abilityChangeSubtypes[0]) : AbilityChangeEvent {
  return {
    type:        "abilityChange",
    subType:     subtype as any,
    sphere:      getSphereData(sphereId),
    stone:       getCrownstoneData(),
    ability:     getAbilityData()
  }
}

let invitationOperations = ["invited", "invitationRevoked"]
export function getInvitationChangeEvent(sphereId, operation = invitationOperations[0]) : InvitationChangeEvent {
  return {
    type:        "invitationChange",
    operation:   operation as any,
    sphere:      getSphereData(sphereId),
    email:       "unit@test.com",
  }
}
export function getSwitchStateUpdateEvent(sphereId) {
  return {
    type:        'switchStateUpdate',
    subType:     'stone',
    sphere:       getSphereData(sphereId),
    crownstone:   getCrownstoneSwitchState(),
  }
}

export function getNameIdSet(id : string = null) {
  return {
    id:   id || "string",
    name: "string"
  }
}
export function getSphereData(sphereId : string, uid : number = null) : SphereData {
  return {
    ...getNameIdSet(sphereId),
    uid: uid || 4
  }
}

export function getUserData(id : string) { return getNameIdSet(id) }
export function getLocationData()        { return getNameIdSet() }
export function getCrownstoneSwitchState() {
  return {
    ...getNameIdSet(),
    percentage: 40, // 0 .. 100
    macAddress: "ab:ce:da:ca:e3",
    uid: 2,
  }
}
export function getCrownstoneData() {
  return {
    ...getNameIdSet(),
    macAddress: "ab:ce:da:ca:e3",
    uid: 2,
  }
}

let crownstoneSwitchDateTypes = ["TURN_ON", "TURN_OFF", "PERCENTAGE"]
export function getCrownstoneSwitchCommand(type : string = "PERCENTAGE") {
  return {
    ...getCrownstoneData(),
    percentage: type === 'PERCENTAGE' ? 40 : undefined, // 0 .. 100
    type: crownstoneSwitchDateTypes[0] || type
  }
}

export function getAbilityData() : AbilityData {
  return {
    type: "test",
    enabled: true,
    syncedToCrownstone: true,
  }
}

export function getAllDataEvents(sphereId : string, userId : string) {
  let dataChangeOptions = [];
  dataChangeSubtype.forEach((s) => {
    dataChangeOperation.forEach((o) => {
      dataChangeOptions.push(getDataChangeEvent(sphereId, userId, s, o))
    })
  })

  return [
    getSwitchStateUpdateEvent(sphereId),
    getMultiSwitchCrownstoneEvent(sphereId),
    getSphereTokensUpdatedEvent(sphereId),
    ...presenceSubTypes.map(        (s) => getPresenceSphereEvent(sphereId, userId, s)),
    ...presenceLocationSubTypes.map((s) => getPresenceLocationEvent(sphereId, userId, s)),
    ...abilityChangeSubtypes.map(   (s) => getAbilityChangeEvent(sphereId, s)),
    ...dataChangeOptions,
    getInvitationChangeEvent(sphereId),
  ]
}
