import {BeruangProperty} from '../../presenter/beruang-property.js';
import {BeruangObserver} from '../../presenter/beruang-observer.js';
import {BeruangView} from '../beruang-view.js';

class BeruangElement extends BeruangObserver(BeruangProperty(BeruangView(HTMLElement))) {
  static _viewTmpl = {};

  constructor() {
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

    this._createShadow((tmpl) => {
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      let nodes = [];
      this._parseNode(shadowRoot, nodes);
      this._solveNode(nodes);
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

  _createShadow(templateCallback) {
    let clsName = this.constructor.name;
    let t = this.constructor._viewTmpl[clsName];
    if(t) {
      templateCallback(t);
    } else {
      let t = document.createElement('template');
      t.innerHTML = this.constructor.template;
      this.constructor._viewTmpl[clsName] = t;
      templateCallback(t);
    }
  }

  get _presenter() {
    return this;
  }

  get _view() {
    return this;
  }

//abstract:BEGIN
  static get template() {
    throw new Error('BeruangElement: you have to call get template ' +
      'implemented by child only!');
  }
//abstract:END
}

export {BeruangElement};
