type Params = {
  meta: string;
  assets: Array<string>;
  body: string;
  style: string;
  scripts: string;
};

const escape = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

export const renderFullPage = ({
  meta,
  assets,
  body,
  style,
  scripts,
}: Params) => {
  return `<!DOCTYPE html>
    <html>
      <head>
        ${meta}
        ${style}
      </head>
      <body>
        <div id="root">
          ${body}
        </div>
        ${scripts}
        ${assets.map((asset) => `<script src=${asset}></script>`).join('\n')}
      </body>
    </html>
  `.trim();
};
