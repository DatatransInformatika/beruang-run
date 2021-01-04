(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {
--primary-color:blue;
--secondary-color:green;
}
</style>`;

  class BeruangTropic extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }

  window.customElements.define('beruang-theme', BeruangTropic);
})();
