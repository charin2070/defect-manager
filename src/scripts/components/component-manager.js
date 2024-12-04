class ComponentManager {
  constructor(componentsConfig) {
    this.components = this.initComponents(componentsConfig);
  }

  initComponents(componentsConfig) {
    const components = {};
    Object.keys(componentsConfig).forEach((id) => {
      const component = componentsConfig[id];
      component.element = document.getElementById(id);
      if (component.element) {
        Object.keys(component.listeners).forEach((event) => {
          component.element.addEventListener(event, component.listeners[event]);
        });
      } else {
        // console.warn(`Element ${id} not found`);
      }
      components[id] = component;
    });
    return components;
  }

  getElement(elementId) {
    const element = this.components[elementId]?.element;
    if (!element) throw new Error(`Element ${elementId} not found`);
    return element;
  }

  addComponent(id, component) {
    this.components[id] = component;
  }
}
