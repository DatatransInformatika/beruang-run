import {BeruangNodeParser} from './nodeparser/beruang-node-parser.js';
import {BeruangTemplateParser} from './nodeparser/beruang-template-parser.js';

export const BeruangView = (base) =>
class extends base {

  constructor() {
    super();
    this._propNodeMap = {};
  }

  set _presenter(p) {
    this.__presenter = p;
  }

  get _presenter() {
    return this.__presenter;
  }
  set _propNodeMap(obj) {

    this.__propNodeMap = obj;
  }

  get _propNodeMap() {
    return this.__propNodeMap;
  }

  get _nodeParser() {
    if(!this.__nodeParser) {
      this.__nodeParser = new BeruangNodeParser();
    }
    return this.__nodeParser;
  }

  get _templateParser() {
    if(!this.__templateParser) {
      this.__templateParser = new BeruangTemplateParser();
    }
    return this.__templateParser;
  }

  _parseNode(root, nodes) {    
    root.childNodes.forEach((node, i) => {
      this._parseNodeDo(node, nodes);
    });
  }

  _parseNodeDo(node, nodes) {
    if(node.nodeType===3/*Text*/) {
      if(this._textParser) {
        this._textParser._parseText(node, this._presenter, this._propNodeMap,
          this._nodeParser);
      }
    } else if(node.nodeType==1/*Element*/) {
      if(node.localName==='style') {
        if(this._styleParser) {
          this._styleParser._parseStyle(node, this._presenter);
          this.styleNode = node;
          nodes.push(node);
        }
      } else if(node.localName==='template') {
        if( node.hasAttribute(this._switchAttribute) ) {
          if(this._switchParser) {
            this._switchParser._parseSwitch(node, this._presenter,
              this._propNodeMap, this._nodeParser, this._templateParser,
              this._switchAttribute);
          }
        } else if( node.hasAttribute(this._arrayAttribute) ) {
          if(this._arrayParser) {
            this._arrayParser._parseArray(node, this._presenter, this._propNodeMap,
              this._nodeParser, this._templateParser, this._arrayAttribute);
          }
        }
      } else {
        if(this.elementParser) {
          this.elementParser._parseElement(node, this._presenter,
            this._propNodeMap, this._nodeParser);
        }
        this._parseNode(node, nodes);//recursive
      }
    }
    if(node.terms) {
      nodes.push(node);
    }
  }

  _updateNode(props) {
    let rslt = [];
    props.forEach((path, i) => {
      let obj = this._pathNodes( path, (node)=>true );
      if(obj.finalNodes.length>0) {
        obj.finalNodes.forEach((node, i) => {
          let substitute = false;
          if(node.nodeType===3/*Text*/) {
            substitute = !!this._textParser;
          } else if(node.nodeType==1/*Element*/) {
            if(node.localName==='template') {
              if( node.hasAttribute(this._switchAttribute) ) {
                substitute = !!this._switchParser;
              } else if( node.hasAttribute(this._arrayAttribute) ) {
                substitute = !!this._arrayParser;
              }
            } else {
              if(node.localName!='style') {
                substitute = !!this.elementParser;
              }
            }
          }
          if(substitute) {
            let val = this._presenter.get(path);
            if(this._nodeParser._pathSubstitute(node, obj.finalPath, val)){
                rslt.push(node);
            }
          }
        });

        if(obj.pathNodes>0) {
          rslt = rslt.concat(obj.pathNodes);
        }
      }//if(obj.finalNodes.length>0) {
    });//props.forEach((path, i) => {
    if(rslt.length>0) {
        this._solveNode(rslt);
    }
  }

  _solveNode(nodes) {
    let clones = [];
    nodes.forEach((node, i) => {
      if(node.nodeType===3/*Text*/) {
        if(this._textParser) {
          this._textParser._solveText(this, node, this._propNodeMap,
            this._nodeParser);
        }
      } else if(node.nodeType==1/*Element*/) {
        if(node.localName==='template') {
          if( node.hasAttribute(this._switchAttribute) ) {
            if(this._switchParser) {
              this._switchParser._solveSwitch(this, node, this._propNodeMap,
                this._nodeParser, this._templateParser);
            }
          } else if( node.hasAttribute(this._arrayAttribute) ) {
            if(this._arrayParser) {
              this._arrayParser._solveArray(this, node, this._propNodeMap,
                this._nodeParser, this._templateParser);
            }
          }
          if(node.clones) {
            clones = clones.concat(node.clones);
          }
        } else {
          if(node.localName!='style') {
            if(this.elementParser) {
              this.elementParser._solveElement(this, node, this._propNodeMap,
                this._nodeParser);
            }
          }
        }
      }
    });
    this._solveClones(clones);
  }

  _arraySplice(path, startIdx, count, removeCount) {
    if(this._arrayParser) {
      let obj = this._pathNodes( path, (node)=>node.hasAttribute &&
        node.hasAttribute(this._arrayAttribute) );
      if(obj.finalNodes.length>0) {
        let rslt = this._arrayParser._splice(obj.finalNodes, startIdx, count,
          removeCount, this._propNodeMap, this._nodeParser, this._templateParser,
          this._arrayAttribute);
        if(rslt.substitutes.length>0) {
          obj.pathNodes = obj.pathNodes.concat(rslt.substitutes);
        }
        this._solveClones(rslt.clones);
        if(obj.pathNodes.length>0) {
          this._solveNode(obj.pathNodes);
        }
      }
    }
  }

  updateStyle(selector, rule, dedup) {
    if(this.styleNode && this._styleParser) {
      this._styleParser._updateStyle(this.styleNode, selector, rule, dedup, this._presenter);
    }
  }

  removeStyle(selector) {
    if(this.styleNode && this._styleParser) {
      this._styleParser._removeStyle(this.styleNode, selector, this._presenter);
    }
  }

  _solveClones(clones) {
    if(clones.length>0) {
      let nodes = [];
      clones.forEach((clone, i) => {
        let ns = [];
        this._parseNodeDo(clone, ns);
        nodes = nodes.concat(ns);
      });
      this._solveNode(nodes);
    }
  }

  _pathNodes(path, finalMatchFunc) {
    let paths = path.split('.');
    let result = {'pathNodes':[], 'finalNodes':[], 'finalPath':paths[0]};
    this._pathNodesDo(paths, 1, this._propNodeMap[paths[0]], finalMatchFunc, result);
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

    nodes.forEach((node, i) => {
      if(node.hasAttribute && node.hasAttribute(this._arrayAttribute)) {
        if(this._arrayParser) {
          let attr = node.getAttribute ? node.getAttribute(this._arrayAttribute)
            : null;
          if( attr && attr==result.finalPath ) {
            if(startIdx >= paths.length) {
              if( finalMatchFunc(node) )
                result.finalNodes.push(node);
              else
                result.pathNodes.push(node);
              return;
            }
            let nexts = [];
            this._arrayParser._termedClones(node,
              (_node, arrTmpl)=>arrTmpl.idx==arrIdx,
              node.clones, nexts, null, this._nodeParser);
            result.finalPath = node.tmpl.fldItem;
            this._pathNodesDo(paths, startIdx+1, nexts, finalMatchFunc, result);
          }
        }
      } else {
        if(startIdx==1 && startIdx>=paths.length) {
          if( finalMatchFunc(node) )
            result.finalNodes.push(node);
          else
            result.pathNodes.push(node);
          return;
        }
        if(node.terms && this._pathExists(node.terms, result.finalPath)){
          if(startIdx >= paths.length && finalMatchFunc(node) ) {
            result.finalNodes.push(node);
          } else {
            result.pathNodes.push(node);
          }
        }
      }
    });
  }

  _pathExists(terms, path) {
    for(let i=0, len=terms.length; i<len ;i++){
      if(terms[i].paths.indexOf(path)>-1){
        return true;
      }
    }
    return false;
  }

  get _switchAttribute() {
    return 'data-switch';
  }

  get _arrayAttribute() {
    return 'data-array';
  }

//abstract:BEGIN
  static get template() {
    throw new Error('BeruangView: you have to call getTemplate method ' +
      'implemented by child only!');
  }
//abstract:END
}
