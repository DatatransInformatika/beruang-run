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
          if( node.hasAttribute(this.tmplSwitch.stmtAttribute()) ) {
            this.tmplSwitch.parse(node, this.presenter, this.propNodeMap);
          } else if( node.hasAttribute(this.tmplArray.stmtAttribute()) ) {
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
            if( node.hasAttribute(this.tmplSwitch.stmtAttribute()) ) {
              if(this.tmplSwitch.substitute(node, p, val, path)){
                hit = true;
              }
            } else if( node.hasAttribute(
                this.tmplArray.stmtAttribute()) ){
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
          if( node.hasAttribute(this.tmplSwitch.stmtAttribute()) ) {
            this.tmplSwitch.solve(this, node, this.propNodeMap);
          } else if( node.hasAttribute(this.tmplArray.stmtAttribute()) ) {
            this.tmplArray.solve(this, node, this.propNodeMap);
          }
          if(node.clones) {
            clones = clones.concat(node.clones);
          }
        } else {

        }
      }
    });

    this._solveClones(clones);
  }

  arrayPush(path, startIdx, count) {
    let obj = this._pathNodes( path, (node)=>node.hasAttribute &&
        node.hasAttribute(this.tmplArray.stmtAttribute()) );
    if(obj.finalNodes.length>0) {
      let clones = this.tmplArray.push(obj.finalNodes, startIdx, count);
      this._solveClones(clones);
      if(obj.pathNodes.length>0) {
        this.solveNode(obj.pathNodes);
      }
    }
  }

  /*arraySplice2(path, prop, startIdx, count, removeCount) {
    let obj = this.tmplArray.splice(path, prop, startIdx, count,
      removeCount, this.propNodeMap);
    if(obj) {
      this._solveClones(obj.clones);
      this.solveNode(obj.substitutes);
    }
  }*/

  arraySplice(path, startIdx, count, removeCount) {
    let obj = this._pathNodes( path, (node)=>node.hasAttribute &&
      node.hasAttribute(this.tmplArray.stmtAttribute()) );
    if(obj.finalNodes.length>0) {
      let rslt = this.tmplArray.splice(obj.finalNodes, startIdx, count,
        removeCount, this.propNodeMap);
      if(rslt.substitutes.length>0) {
        obj.pathNodes = obj.pathNodes.concat(rslt.substitutes);
      }
      this._solveClones(rslt.clones);
      if(obj.pathNodes.length>0) {
        this.solveNode(obj.pathNodes);
      }
    }
  }

  _solveClones(clones) {
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

///////////////////////////////////////////////////////////////////
  _pathNodes(path, finalMatchFunc) {
    let paths = path.split('.');
    let result = {'pathNodes':[], 'finalNodes':[], 'finalPath':paths[0]};
    this._pathNodesDo(paths, 1, this.propNodeMap[paths[0]], finalMatchFunc, result);
    return result;
  }

  _pathNodesDo(paths, startIdx, nodes, finalMatchFunc, result)
  {
    if(!(nodes && nodes.length>0)){
      return;
    }

    let arrIdx = -1;
    for(; startIdx<paths.length; startIdx++) {
      let s = paths[startIdx];
      if( isNaN(s) ) {
        result.finalPath += '.' + s;
      } else {
        arrIdx = parseInt(s, 10);
        break;
      }
    }

    let arrAttr = this.tmplArray.stmtAttribute();
    nodes.forEach((node, i) => {
      if(node.hasAttribute && node.hasAttribute(arrAttr)) {
        let attr = node.getAttribute ? node.getAttribute(arrAttr) : null;
        if( attr && attr==result.finalPath ) {
          if(startIdx >= paths.length) {
            if( finalMatchFunc(node) )
              result.finalNodes.push(node);
            else
              result.pathNodes.push(node);
            return;
          }
          let nexts = [];
          this.tmplArray._termedClones(node,
            (_node, _arrayTemplate)=>_arrayTemplate.idx==arrIdx,
            node.clones, nexts, null);
          result.finalPath = node.tmpl.fldItem;
          this._pathNodesDo(paths, startIdx+1, nexts, finalMatchFunc, result);
        }
      } else {
        if(startIdx==1 && startIdx>=paths.length) {
          if( finalMatchFunc(node) )
            result.finalNodes.push(node);
          else
            result.pathNodes.push(node);
          return;
        }
        if(node.terms && this.textNode.pathExists(node.terms, result.finalPath)){
          if(startIdx >= paths.length && finalMatchFunc(node) ) {
            result.finalNodes.push(node);
          } else {
            result.pathNodes.push(node);
          }
        }
      }
    });
  }
/////////////////////////////////////////////////////////////
}
