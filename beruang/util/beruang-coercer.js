class BeruangCoercer {

  coerce(expectedType, val) {
    let n = null;
    switch(expectedType) {
      case Boolean:
        n = this.toBoolean(val);
        break;
      case String:
        n = this.toString(val);
        break;
      case Number:
        n = this.toNumber(val);
        break;
      case Date:
        n = this.toDate(val);
        break;
      case Object:
        n = this.toObject(val);
        break;
      case Array:
        n = this.toArray(val);
        break;
      default:
        break;
    }
    return n;
  }

  toBoolean(val) {
    if(val===undefined || val===null) {
      return false;
    }
    let v = null;
    switch(val.constructor.name) {
      case 'Boolean':
        v = val.toString()==='true';
        break;
      case 'Number':
        v = val!=0;
        break;
      case 'String':
        v = ['true', 't'].indexOf(val.trim().toLowerCase()) > -1;
        break;
      default:
        v = true;
        break;
    }
    return v;
  }

  toString(val) {
    if(val===undefined || val===null) {
      return null;
    }
    let v = null;
    switch(val.constructor.name) {
      case 'String':
        v = val;
        break;
      default:
        v = val.toString ? val.toString() : ('' + val);
        break;
    }
    return v;
  }

  toNumber(val) {
    if(val===undefined || val===null) {
      return 0;
    }
    let v = 0;
    switch(val.constructor.name) {
      case 'Number':
        break;
      case 'String':
      v = val;
        v = Number.parseFloat(val, 10);
        break;
      case 'Date':
        v = val.getMilliseconds();
        break;
      case 'Boolean':
        v = val==true ? 1 : 0;
        break;
      default:
        break;
    }
    return v;
  }

  toDate(val) {
    if(val===undefined || val===null) {
      return null;
    }
    let v = null;
    switch(val.constructor.name) {
      case 'Date':
        v = val;
        break;
      case 'Number':
        v = new Date(val);
        break;
      case 'String': /*in UTC format '2011-04-11T10:20:30Z'*/
        val = val.trim();
        if( /^[0-9]{4}(-[0-9]{2}){2}T[0-9]{2}(:[0-9]{2}){2}Z$/.test(val) ) {
          v = new Date(val);
        }
        break;
      default:
        break;
    }
    return v;
  }

  toObject(val) {
    if(val===undefined || val===null) {
      return null;
    }
    return val.constructor.name==='Object' ? val : null;
  }

  toArray(val) {
    if(val===undefined || val===null) {
      return null;
    }
    let v = null;
    switch(val.constructor.name) {
      case 'Array':
        v = val;
        break;
      default:
        v = [val];
        break;
    }
    return v;
  }

}

export {BeruangCoercer};
