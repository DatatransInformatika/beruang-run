import {BeruangElement} from '../../beruang-element.js'

class BeruangIconSvg extends BeruangElement {

  static get properties() {
    return {
      name: {
        type:String,
        value:'',
        observer:'_nameChanged'
      },

      size: {
        type:Number,
        value:24
      }
    }
  }

  static get template() { return ''; }

  createIcon(element, iconName) {
    this.removeIcon(element);
    this._icons = this._icons || this._createIconMap();
    let src = this._icons[iconName];
    if(!src) {
      return;
    }
    let g = src.cloneNode(true);
    let viewBox = g.getAttribute('viewBox') || '0 0 ' + this.size + ' ' +
      this.size;
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('focusable', 'false');
    svg.style.cssText = 'pointer-events: none; display: block; width: 100%; height: 100%;';
    svg.appendChild(g).removeAttribute('id');
    let container = element.shadowRoot || element;
    container.insertBefore(svg, container.childNodes[0]);
    element._icon = svg;
  }

  removeIcon(element) {
    if(element._icon) {
      element._icon.parentNode.removeChild(element._icon);
      delete element._icon;
    }
  }

  _nameChanged(newVal, oldVal) {
    if(oldVal) {
      window.iconset.delete(oldVal);
    }
    window.iconset[newVal] = this;
  }

  _createIconMap() {
    let icons = Object.create(null);
    this.querySelectorAll('[id]').forEach((icon)=>{
      icons[icon.id] = icon;
    });
    return icons;
  }
}

window.customElements.define('beruang-icon-svg', BeruangIconSvg);
