interface EventFilter {
  type?:     "presence"  | "command" | "*" | "all",
  // stoneIds?  : { [key: string]: boolean }, // only get events from this Crownstone
  sphereIds? : { [key: string]: boolean }
}


interface AccessModel {
  accessToken: string,
  ttl: number,
  createdAt: number,
  userId: string,
  spheres: {
    [key: string] : { boolean }
  }
}

interface SystemEvent {
  type:    "system",
  code:     number,
  message:  string,
}

interface SwitchCrownstoneEvent {
  type:       "command",
  subType:    "switchCrownstone"
  sphere:     SphereData,
  crownstone: CrownstoneData,
}

interface PresenceSphereEvent {
  type:     "presence",
  subType:  "enterSphere" | "exitSphere"
  user:     UserData,
  sphere:   SphereData
}

interface PresenceLocationEvent {
  type:     "presence",
  subType:  "enterLocation" | "exitLocation"
  user:     UserData,
  sphere:   SphereData,
  location: LocationData,
}


interface NameIdSet {
  id:   string,
  name: string
}
interface UserData       extends NameIdSet {}
interface SphereData     extends NameIdSet {
  uid: number
}
interface LocationData   extends NameIdSet {}
interface CrownstoneData extends NameIdSet {
  switchState: number,
  macAddress: string,
  uid: number,
}


type RoutingMap = {
  all: ArrayMap,
  presence: ArrayMap,
  command: ArrayMap,
}
type ArrayMap = { [key: string] : string[] }