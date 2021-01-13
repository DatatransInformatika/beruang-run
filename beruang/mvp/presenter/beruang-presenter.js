import {BeruangProperty} from './beruang-property.js';
import {BeruangObserver} from './beruang-observer.js';

export const BeruangPresenter = (base) =>
class extends BeruangObserver(BeruangProperty(base)) {

  constructor(viewFactory){
    super();

    let prop = {};
    let obs = [];
    let cls = this.constructor;
    while(cls) {
      if(cls.observers) {
        obs = obs.concat(cls.observers);
      }
      if(cls.properties) {
        for (let [p, v] of Object.entries(cls.properties)) {
          if(!prop.hasOwnProperty(p)) {
            prop[p]=v;
          }
        }
      }
      cls = Object.getPrototypeOf(cls);//parent
    }
    this._setObserver(obs);
    this._setProperty(prop);

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

  static get properties() {
    return {
      connected:{
        type:Boolean,
        value:false
      }
    };
  }

  connectedCallback() {
    this.connected = true;
  }

  set onReady(f) {
    if(this.shadowRoot) {
      f();
    } else {
      let x = setInterval(
        ()=>{
          if(this.shadowRoot) {
            clearInterval(x);
            f();
          }
        }, 100);
    }
  }

  get _view() {
    return this.__view;
  }

  set _view(v) {
    this.__view = v;
  }
}
