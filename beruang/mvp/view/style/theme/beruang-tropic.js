(function() {
  const template = document.createElement('template');
  template.innerHTML = `
<style>
:host {
--primary-color:#1976d2;
--primary-light-color:#63a4ff;
--primary-dark-color:#004ba0;
--primary-text-color:#ffffff;
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
