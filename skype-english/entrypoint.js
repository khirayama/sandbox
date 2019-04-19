class DocumentView {
  constructor(el) {
    this.el = el;
    this.inputElement = this.el.querySelector('.DocumentView--Input');
    this.webviewElement = this.el.querySelector('.DocumentView--WebView');

    this.webviewElement.src = this.inputElement.value;
    this.setEventListeners();
  }
  setEventListeners() {
    this.inputElement.addEventListener('change', () => {
      const src = this.inputElement.value;
      this.webviewElement.src = src;
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new DocumentView(window.document.querySelector('.DocumentView'));
  // const webviewElements = window.document.querySelectorAll('webview');
  // for (const webviewElement of webviewElements) {
  //   webviewElement.style.width = webviewElement.clientWidth + 'px';
  //   webviewElement.style.height = webviewElement.clientHeight + 'px';
  // }
});
