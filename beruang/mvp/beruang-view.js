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

  get tmplArray() {
    if(!this._tmplArray) {
      this._tmplArray = new BeruangTemplateArray();
    }
    return this._tmplArray;
  }

  get element() {
    if(!this._element) {
      this._element = new BeruangElement();
    }
    return this._element;
  }

  parseTemplate(root, nodes) {
    root.childNodes.forEach((node, i) => {
      this._parseNode(node, nodes);
    });
  }

  _parseNode(node, nodes) {
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
            this.tmplArray.parse(node, this.presenter, this.propNodeMap);
          }
        } else {
          this.parseTemplate(node, nodes);//recursive
        }
      }
      if(node.terms) {
        nodes.push(node);
      }
    }
  }

  updateNode(props, path/*may be null*/) {
    let affectedNodes = [];

    props.forEach((p, i) => {
      let nodes = this.propNodeMap[p];
      if(!nodes) {
        return;
      }
      let val = this.presenter[p];
      nodes.forEach((node, i) => {
        let hit = false;
        if(node.nodeType===3/*Text*/) {
          if(this.textNode.substitute(node, p, val, path)){
            hit = true;
          }
        } else if(node.nodeType==1/*Element*/) {
          if(node.localName==='template') {
            if( node.hasAttribute('data-tmpl-switch') ) {
              if(this.tmplSwitch.substitute(node, p, val, path)){
                hit = true;
              }
            } else if( node.hasAttribute('data-tmpl-array') ) {
              let obj = this.tmplArray.arraySubstitute(node, p, val, path);
              if(obj.clones) {
                obj.clones.forEach((clone, i) => {
                  if(affectedNodes.indexOf(clone)==-1) {
                    affectedNodes.push(clone);
                  }
                });
              }
              if(obj.hit) {
                hit = true;
              }
            }
          } else {

          }
        }
        if(hit) {
          if(affectedNodes.indexOf(node)==-1){
            affectedNodes.push(node);
          }
        }
      });
    });

    this.solveNode(affectedNodes);
  }

  solveNode(nodes) {
    let clones = [];

    nodes.forEach((node, i) => {
      if(node.nodeType===3/*Text*/) {
        this.textNode.solve(this, node, this.propNodeMap);
      } else if(node.nodeType==1/*Element*/) {
        if(node.localName==='template') {
          if( node.hasAttribute('data-tmpl-switch') ) {
            this.tmplSwitch.solve(this, node, this.propNodeMap);
          } else if( node.hasAttribute('data-tmpl-array') ) {
            this.tmplArray.solve(this, node, this.propNodeMap);
          }
          if(node.clones) {
            clones = clones.concat(node.clones);
          }
        } else {

        }
      }
    });

    if(clones.length>0) {
      let nodes = [];
      clones.forEach((clone, i) => {
        let ns = [];
        this._parseNode(clone, ns);
        nodes = nodes.concat(ns);
      });
      this.solveNode(nodes);
    }
  }

}
