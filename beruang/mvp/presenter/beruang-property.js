import {BeruangCoercer} from '../../util/beruang-coercer.js';

export const BeruangProperty = (base) =>
class extends base {
  constructor() {
    super();
    this._prop = {};
  }

  get _prop() {
    return this.__prop;
  }

  set _prop(obj) {
    this.__prop = obj;
  }

  get(path) {
    let objFld = this._getObjField(path);
    if(!objFld) {
      return null;
    }
    return objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
  }

  set(path, val) {
    let objFld = this._getObjField(path);
    if(objFld) {
      let oldVal = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
      if(val!=oldVal) {
        if(objFld.fld) {
          objFld.obj[objFld.fld] = val;
          this._view._updateNode([path]);
        //homework:multiple observer should handle this
        } else {
          this[objFld.prop] = val;
        }
      }
    }
  }

  get _coercer() {
    if(!this.__coercer) {
      this.__coercer = new BeruangCoercer();
    }
    return this.__coercer;
  }

  _setProperty(props) {
    for (let [p, v] of Object.entries(props)) {
      if(this.hasOwnProperty(p)) {
        continue;
      }

      let validType = v.type===Boolean || v.type===String || v.type===Number
        || v.type===Date
        || v.type===Object || v.type===Array;

      if(validType) {
        Object.defineProperty(this, p,
          { get:this._getter(p, v.type),
            set:this._setter(p, v.type, v.observer, v.reflectToAttribute)
          });

        let _v;

        let attr = this._toAttribute(p);
        if( this.hasAttribute(attr) ) {
            if(v.type===Boolean) {
              _v = true;
            } else {
              _v = this.getAttribute(attr);
            }
        } else {
            if(typeof v.value === 'function') {
              _v = v.value();
            } else {
              _v = v.value;
            }
        }

        this[p] = this._coercer.coerce(v.type, _v);
      }
    }
  }

  _getter(p, vt) {
    return ()=>{
      return this._prop[p];
    };
  }

  _setter(p, vt, observer, reflectToAttr) {
    return (val)=>{
      if(val===undefined) {
        val = null;
      }

      let old = this[p];
      this._prop[p] = val;
      val = this[p];

      if(val===old) {
          return;
      }

      if(this._view) {
        this._delayedUpdateNode(p);
      }

      if(observer){
        if(this[observer]) {
          this[observer].apply(this, [val, old]);
        } else if(this._view[observer]) {
          this._view[observer].apply(this, [val, old]);
        }
      }

      this._multiObserver(p);

      if(reflectToAttr) {
        let attr = this._toAttribute(p);
        if(vt===Boolean) {
          if(val){
            this.setAttribute(attr, '');
          } else {
            this.removeAttribute(attr);
          }
        } else {
          val = this._coercer.coerce(String, val);
          this.setAttribute(attr, val==null ? '' : val);
        }
      }
    };
  }

  _toAttribute(s) {
    return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
  }

  _delayedUpdateNode(prop) {
    this._updatedProps = this._updatedProps || [];
    if(this._updatedProps.indexOf(prop)>-1){
      return;
    }
    this._updatedProps.push(prop);
    if(this._updateNodeXval) {
      clearTimeout(this._updateNodeXval);
    }
    this._updateNodeXval = setTimeout(
      ()=>{
          this._view._updateNode(this._updatedProps);
          this._updateNodeXval = null;
          this._updatedProps = null;
      }, 50);
  }

  _getObjField(path) {
    let arr = path.split('.');
    let p0 = arr[0];
    let propKeys = Object.keys(this._prop);
    if(propKeys.indexOf(p0)==-1){
      return null;
    }
    let obj = this[p0];
    let lastIdx = arr.length - 1;
    for(let i=1; obj!=undefined && obj!=null & i<lastIdx; i++) {
      if(obj.hasOwnProperty(arr[i])) {
        obj = obj[arr[i]];
      } else {
        obj = null;
      }
    }
    if(obj===undefined || obj===null) {
      return null;
    }
    let fld = lastIdx>0 ? arr[lastIdx] : null;
    if(fld && !obj.hasOwnProperty(fld)) {
      return null;
    }
    return {'prop':p0, 'obj':obj, 'fld':fld};
  }
}
