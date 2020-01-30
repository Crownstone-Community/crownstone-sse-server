

export const EventGenerator = {

  getStartEvent() : string {
    let startEvent: SystemEvent = {
      type:    "system",
      code:     200,
      message: "Stream Starting."
    };
    return JSON.stringify(startEvent);
  },

  getErrorEvent(code, message) : string {
    let startEvent: SystemEvent = {
      type:    "system",
      code:     code,
      message: message,
    };
    return JSON.stringify(startEvent);
  }
}