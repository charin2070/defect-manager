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
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(eventHandler);
  }

  // Generate (trigger) an event
  emit(eventName, eventData = {}) {
    console.log(`⚡ ${eventName}: ${eventData} from ${this.parent}`); 
      this.events[eventName].forEach(handler => {
        try {
          handler(eventData);
        } catch (error) {
          // Handle error silently
        }
      });
    }
  }
