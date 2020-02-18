

export const EventGenerator = {

  getStartEvent() : string {
    let startEvent: SystemEvent = {
      type:    "system",
      code:     200,
      message: "Stream Starting."
    };
    return "data:" + JSON.stringify(startEvent) + '\n\n';
  },

  getErrorEvent(code, message) : string {
    let startEvent: SystemEvent = {
      type:    "system",
      code:     code,
      message: message,
    };
    return "data:" + JSON.stringify(startEvent) + '\n\n';
  }
}