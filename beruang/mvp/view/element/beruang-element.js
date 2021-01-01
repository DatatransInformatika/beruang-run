import {BeruangProperty} from '../../presenter/beruang-property.js'
import {BeruangView} from '../beruang-view.js'

class BeruangElement extends BeruangProperty(BeruangView(HTMLElement)) {
  static _viewTmpl = {};

  constructor() {
    super();
    this.createTemplate((tmpl) => {
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      let nodes = [];
      this.parseTemplate(shadowRoot, nodes);
      this.solveNode(nodes);
    });
  }

  createTemplate(templateCallback) {
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

  get presenter() {
    return this;
  }

  get view() {
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
