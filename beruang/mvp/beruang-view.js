import {BeruangTextNode} from './noderesolver/beruang-textnode.js';
import {BeruangTemplateSwitch} from './noderesolver/beruang-template-switch.js';
import {BeruangTemplateArray} from './noderesolver/beruang-template-array.js';
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

  get tmplSwitch() {
    if(!this._tmplSwitch) {
      this._tmplSwitch = new BeruangTemplateSwitch();
    }
    return this._tmplSwitch;
  }

  get element() {
    if(!this._element) {
      this._element = new BeruangElement();
    }
    return this._element;
  }

  parseTemplate(root) {
    root.childNodes.forEach((node, i) => {
      this._parseNode(node);
    });
  }

  _parseNode(node) {
    if(node.localName==='style') {
      //parse style here
    } else {
      if(node.nodeType===3/*Text*/) {
        this.textNode.parse(node, this.presenter, this.propNodeMap);
      } else if(node.nodeType==1/*Element*/) {
        if(node.localName==='template') {
          if( node.hasAttribute('data-tmpl-switch') ) {
            this.tmplSwitch.parse(node, this.presenter, this.propNodeMap);
          } else if( node.hasAttribute('data-tmpl-array') ) {

          }
        } else {
          //this.element.parse(....);
          this.parseTemplate(node);//recursive
        }
      }
    }
  }

  updateNode(props, nodeExcludes) {
    let visitedNodes = [];
    let affectedNodes = [];
    let clones = [];

    props.forEach((p, i) => {
      let nodes = this.propNodeMap[p];
      if(!nodes) {
        return;
      }
      let val = this.presenter[p];
      nodes.forEach((node, i) => {
        if(nodeExcludes.indexOf(node)>-1){
          return;
        }
        let hit = false;
        if(node.nodeType===3/*Text*/) {
          this.textNode.substitute(node, p, val);
          hit = true;
        } else if(node.nodeType==1/*Element*/) {
          //this.element.substitute(node, p, val);
          if(node.localName==='template') {
            if( node.hasAttribute('data-tmpl-switch') ) {
              this.tmplSwitch.substitute(node, p, val);
              hit = true;
            } else if( node.hasAttribute('data-tmpl-array') ) {

            }
          } else {

          }
        }

        if(visitedNodes.indexOf(node)==-1) {
          visitedNodes.push(node);
        }

        if(hit) {
          if(affectedNodes.indexOf(node)==-1){
            affectedNodes.push(node);
          }
        }
      });
    });

    affectedNodes.forEach((node, i) => {
      if(node.nodeType===3/*Text*/) {
        this.textNode.solve(this, node, this.propNodeMap);
      } else if(node.nodeType==1/*Element*/) {
        //this.element.solve(this, node);
        if(node.localName==='template') {
          if( node.hasAttribute('data-tmpl-switch') ) {
            this.tmplSwitch.solve(this, node, this.propNodeMap);
          } else if( node.hasAttribute('data-tmpl-array') ) {

          }
          if(node.clones) {
            clones = clones.concat(node.clones);
          }
        } else {

        }
      }
    });

    if(clones.length>0) {
      let excludes = nodeExcludes.concat(visitedNodes);
      clones.forEach((clone, i) => {
        this._parseNode(clone);
        this.updateNode(Object.keys(this.presenter.prop), excludes);
      });
    }
  }

}
