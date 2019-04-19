class DocumentView {
  constructor(el) {
    this.el = el;
    this.inputElement = this.el.querySelector('.DocumentView--Input');
    this.webviewElement = this.el.querySelector('.DocumentView--WebView');
    this.pdfviewElement = this.el.querySelector('.DocumentView--PDFView');

    this.pdfviewElement.width = this.webviewElement.clientWidth;
    this.pdfviewElement.height = this.webviewElement.clientHeight;
    const src = this.inputElement.value;
    this.renderDocument(src);
    this.setEventListeners();
  }
  setEventListeners() {
    this.webviewElement.addEventListener('will-navigate', (event) => {
      const url = event.url;
      this.inputElement.value = url;
    });

    this.inputElement.addEventListener('change', () => {
      const src = this.inputElement.value;
      this.renderDocument(src);
    });
  }
  renderDocument(src) {
    if (src.indexOf('pdf') === -1) {
      this.webviewElement.style.display = 'inline-flex';
      this.pdfviewElement.style.display = 'none';
      this.webviewElement.src = src;
    } else {
      this.webviewElement.style.display = 'none';
      this.pdfviewElement.style.display = 'inline-block';
      this.renderPDF(src);
    }
  }
  renderPDF(src) {
    pdfjsLib.getDocument(src).then((pdf) => {
      for (let i = 1; i < pdf.numPages; i += 1) {
        const canvas = document.createElement('CANVAS');
        this.pdfviewElement.appendChild(canvas);
        pdf.getPage(i).then((page) => {
          const context = canvas.getContext('2d');
          const scale = 1.2;
          const viewport = page.getViewport(scale);
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const renderContext = {
            canvasContext: context,
            viewport,
          };
          page.render(renderContext);
        });
      }
    });
  }
}

class SkypeView {
  constructor(el) {
    this.el = el;
    this.adjustButtonElement = this.el.querySelector('.SkypeView--AdjustButton');
    this.webviewElement = this.el.querySelector('.SkypeView--WebView');

    this.setEventListeners();
  }
  setEventListeners() {
    this.adjustButtonElement.addEventListener('click', () => {
      const height = 400;
      this.webviewElement.executeJavaScript(`
        try {
          const buttonEl = document.querySelector('button[aria-label="Open Conversation"]');
          const videoEl = document.querySelector('body > div > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(1)');
          const chatEl = document.querySelector('body > div > div > div:nth-child(1) > div:nth-child(2) > div > div > div:nth-child(2)');
          buttonEl.click();
          setTimeout(() => {
            videoEl.style.height = '${height}px';
            chatEl.style.height = 'calc(100% - ${height}px)';
            chatEl.style.top = 'unset';
          }, 500);
        } catch(err) {
          window.alert(err);
        }
      `);
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new DocumentView(window.document.querySelector('.DocumentView'));
  new SkypeView(window.document.querySelector('.SkypeView'));
});
