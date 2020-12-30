export const BeruangArray = (base) =>
class extends base {

  constructor() {
    super();
  }

  push(path, ...items) {//return new array length
    let arr = this.getArray(path);
    if(!arr) {
      return 0;
    }
    let startIdx = arr.length;
    arr.push(...items);
    this.view.arraySplice(path, startIdx, items.length, 0);
    return arr.length;
  }

  splice(path, index, removeCount, ...items) {//return removed items
    let arr = this.getArray(path);
    if(!arr) {
      return 0;
    }
    if(index >= arr.length) {
      this.push(path, ...items);
      return 0;
    }
    let removes = arr.splice(index, removeCount, ...items);
    this.view.arraySplice(path, index, items.length, removeCount);
    return removes;
  }

  unshift(path, ...items) {//return new length
    let arr = this.getArray(path);
    if(!arr) {
      return 0;
    }
    arr.unshift(...items);
    this.view.arraySplice(path, 0, items.length, 0);
    return arr.length;
  }

  shift(path) {//return removed item
    let arr = this.getArray(path);
    if(!arr) {
      return null;
    }
    let ret = arr.shift();
    this.view.arraySplice(path, 0, 0, 1);
    return ret;
  }

  getArray(path) {
    let objFld = this.getObjField(path);
    if(!objFld) {
      return null;
    }
    let arr = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
    return arr && arr.constructor.name=='Array' ? arr : null;
  }

}
