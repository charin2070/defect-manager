class EventEmitter {
  constructor(parent, config = {}) {
    this.setParent(parent);
    this.config = config;
    this.events = {}; // Object for storing events and their listeners
  }

  setParent(parent) {
    this.parent = parent;
  }

  // Get application name
  getAppName() {
    return this.appName;
  }

  // Subscribe to an event
  on(eventName, eventHandler) {
    console.log(` [EventEmitter.on] Adding handler for ${eventName}`);
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(eventHandler);
  }

  // Generate (trigger) an event
  emit(eventName, eventData = {}) {
    console.log(` [EventEmitter.emit] Emitting ${eventName}`, eventData);
    
    if (this.events[eventName]) {
      this.events[eventName].forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          console.error(`Error in ${eventName} handler:`, error);
        }
      });
    }
  }
}