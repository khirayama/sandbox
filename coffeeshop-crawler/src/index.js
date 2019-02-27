const puppeteer = require('puppeteer');

async function getNode(page, url) {
  await page.goto(url);
  const content = await page.$eval('body', (el) => {
    const node = {
      url: window.location.href,
      hostname: window.location.hostname,
      title: window.document.title,
      description: '',
      keywords: '',
      content: el.innerText,
      links: [],
    };

    const metaElements = window.document.querySelectorAll('meta');
    for (let i = 0; i < metaElements.length; i += 1) {
      const metaElement = metaElements[i];
      const property = metaElement.getAttribute('property');
      const name = metaElement.getAttribute('name');
      if (property === 'description' || name === 'description') {
        node.description = metaElement.getAttribute('content');
      }
      if (property === 'keywords' || name === 'keywords') {
        node.keywords = metaElement.getAttribute('content');
      }
    }

    const linkElements = el.querySelectorAll('a');
    for (let i = 0; i < linkElements.length; i += 1) {
      const linkElement = linkElements[i];
      if (linkElement.href && linkElement.innerText) {
        node.links.push({
          url: linkElement.href,
          text: linkElement.innerText,
        });
      }
    }
    return node;
  });

  return content;
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const node = await getNode(page, 'https://www.saredocoffee.com/');
  console.log(node);

  await browser.close();
})();
