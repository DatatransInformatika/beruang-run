import {BeruangProperty} from '../../presenter/beruang-property.js'
import {BeruangView} from '../beruang-view.js'

export const BeruangElement = (base) =>
class extends BeruangProperty(BeruangView(base)) {
  static _viewTmpl = {};

  constructor() {
    super();
    this._createShadow((tmpl) => {
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      let nodes = [];
      this._parseNode(shadowRoot, nodes);
      this._solveNode(nodes);
    });
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
