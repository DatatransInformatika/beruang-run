import {BeruangElement} from '../../beruang-element.js'

class BeruangIcon extends BeruangElement {

  static get properties() {
    return {
      icon: {
        type:String,
        value:''
      }
    }
  }

  static get template() { return `<style>
    :host {
      display:inline-block;
      fill:currentcolor;
      stroke:none;
    }`;
  }

  static get observers() {
    return ['_iconChanged(connected, icon)'];
  }

  _iconChanged(connected, icon) {
    if(!connected) {
      return;
    }
    if(this._iconset) {
      this._iconset.removeIcon(this);
    }
    let parts = (icon || '').split(':');
    this._iconName = parts.pop();
    this._iconSetName = parts.pop();
    this._createIcon();
  }

  _createIcon() {
    this._iconset = window.iconset[this._iconSetName];
    if(!this._iconset) {
      if(!this._fbind) {
        this._fbind = this._createIcon.bind(this);
        window.addEventListener('iconset', this._fbind);
      }
    } else {
      this._iconset.createIcon(this, this._iconName);
      if(this._fbind) {
        window.removeEventListener('iconset', this._fbind);
        delete this._fbind;
      }
      delete this._iconName;
      delete this._iconSetName;
    }
  }

}

window.customElements.define('beruang-icon', BeruangIcon);
