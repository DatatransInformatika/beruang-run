import {BeruangTextNode} from './noderesolver/beruang-textnode.js';
import {BeruangElement} from './noderesolver/beruang-element.js';

export const BeruangView = (base) =>
class extends base {

  constructor() {
    super();
    this.propNodeMap = {};
  }

  set presenter(p) {
    this._presenter = p;
  }

  get presenter() {
    return this._presenter;
  }

  set propNodeMap(obj) {
    this._propNodeMap = obj;
  }

  get propNodeMap() {
    return this._propNodeMap;
  }

  get textNode() {
    if(!this._textNode) {
      this._textNode = new BeruangTextNode();
    }
    return this._textNode;
  }

  get element() {
    if(!this._element) {
      this._element = new BeruangElement();
    }
    return this._element;
  }

  parseTemplate(root) {
    root.childNodes.forEach((node, i) => {
      if(node.localName==='style') {
        //parse style here
      } else {
        if(node.nodeType===3/*Text*/) {
          let props = Object.keys(this.presenter.prop);
          this.textNode.parse(node, props, this.presenter, this.propNodeMap);
        } else if(node.nodeType==1/*Element*/) {
          //this.element.parse(....);
          this.parseTemplate(node);//recursive
        }
      }
    });
  }

  updateNode(props) {
    let affectedNodes = [];

    props.forEach((p, i) => {
      let val = this.presenter[p];
      this.propNodeMap[p].forEach((node, i) => {
        if(node.nodeType===3/*Text*/) {
          this.textNode.substitute(node, p, val);
        } else if(node.nodeType==1/*Element*/) {
          //this.element.substitute(node, p, val);
        }
        if(affectedNodes.indexOf(node)==-1){
          affectedNodes.push(node);
        }
      });
    });

    affectedNodes.forEach((node, i) => {
      if(node.nodeType===3/*Text*/) {
        this.textNode.solve(this, node);
      } else if(node.nodeType==1/*Element*/) {
        //this.element.solve(this, node);
      }
    });
  }

}
