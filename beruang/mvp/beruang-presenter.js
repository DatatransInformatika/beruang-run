import {BeruangProperty} from './beruang-property.js';

export const BeruangPresenter = (base) =>
class extends BeruangProperty(base) {

  constructor(viewFactory){
    super();

    let cls = this.constructor;
    while(cls) {
      if(cls.properties) {
        this.setProperty(cls.properties);
      }
      cls = Object.getPrototypeOf(cls);//parent
    }

    viewFactory.createView((viewClass, tmpl)=>{
      this.view = new viewClass.prototype.constructor();
      this.view.presenter = this;
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      this.view.parseTemplate(shadowRoot);
      this.view.updateNode(Object.keys(this.view.propNodeMap), []);
    });
  }

  set readyCallback(f) {
    window.customElements.whenDefined(this.localName).then(()=>{ f(); });
  }

  get view() {
    return this._view;
  }

  set view(v) {
    this._view = v;
  }
}
