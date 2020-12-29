export const BeruangArray = (base) =>
class extends base {

  constructor() {
    super();
  }

  push(path, ...items) {//return new array length
    let obj = this._getArray(path);
    if(!obj) {
      return 0;
    }
    let startIdx = obj.arr.length;
    items.forEach((item, i) => {
      obj.arr.push(item);
    });
    this.view.arrayPush(path, obj.prop, startIdx, items.length);
    return obj.arr.length;
  }

  splice(path, index, removeCount, ...items) {//return removed count
    let obj = this._getArray(path);
    if(!obj) {
      return 0;
    }
    if(index >= obj.arr.length) {
      this.push(path, items);
      return 0;
    }
    let len0 = obj.arr.length;
    for(let i=0; i<removeCount; i++) {
      obj.arr.splice(index, 1);
    }
    let removes = len0 - obj.arr.length;
    let pushIdx = index;
    items.forEach((item, i) => {
      obj.arr.splice(pushIdx++, 0, item);
    });
    this.view.arraySplice(path, obj.prop, index, items.length, removeCount);
    return removes;
  }

  unshift(path, ...items) {//return new length
    let obj = this._getArray(path);
    if(!obj) {
      return 0;
    }
    let pushIdx = 0;
    items.forEach((item, i) => {
      obj.arr.splice(pushIdx++, 0, item);
    });
    this.view.arraySplice(path, obj.prop, 0, items.length, 0);
    return obj.arr.length;
  }

  _getArray(path) {
    let objFld = this._getObjField(path);
    if(!objFld) {
      return null;
    }
    let arr = objFld.fld ? objFld.obj[objFld.fld] : objFld.obj;
    return arr && arr.constructor.name=='Array' ?
      {'arr':arr, 'prop':objFld.prop} : null;
  }

}
