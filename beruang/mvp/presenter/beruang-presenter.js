import {BeruangProperty} from './beruang-property.js';

export const BeruangPresenter = (base) =>
class extends BeruangProperty(base) {

  constructor(viewFactory){
    super();

    let cls = this.constructor;
    while(cls) {
      if(cls.properties) {
        this._setProperty(cls.properties);
      }
      cls = Object.getPrototypeOf(cls);//parent
    }

    viewFactory._createView((viewClass, tmpl)=>{
      this._view = new viewClass.prototype.constructor();
      this._view._presenter = this;
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      let nodes = [];
      this._view._parseNode(shadowRoot, nodes);
      this._view._solveNode(nodes);
    });
  }

  set readyCallback(f) {
    window.customElements.whenDefined(this.localName).then(()=>{ f(); });
  }

  get _view() {
    return this.__view;
  }

  set _view(v) {
    this.__view = v;
  }
}
