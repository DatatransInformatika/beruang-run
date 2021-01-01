(function() {
  const template = document.createElement('template');
  template.innerHTML = `
  <style>
  *::part(bigfont) {
    font-size:30px;
  }
  </style>`;

  class BeruangLayout extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  window.customElements.define('beruang-layout', BeruangLayout);
})();
