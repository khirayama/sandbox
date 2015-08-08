import htmlparser from 'htmlparser2';

let htmlObj;
let rawHtml = `<ul><li><a href="#"></a></li><li><input type="text"/><label>aaa</label></li></ul>`;
let handler = new htmlparser.DomHandler((error, dom) => {
  if (!error) htmlObj = dom;
});
let parser = new htmlparser.Parser(handler);

parser.write(rawHtml);
parser.done();

console.log(htmlObj);
