import htmlparser from 'htmlparser2';


window.onload = () => {
  let htmlObj;
  let rawHtml = `<ul><li><a href="#"></a></li><li><input type="text"/><label>aaa</label></li></ul>`;
  let handler = new htmlparser.DomHandler((error, dom) => {
    if (!error) htmlObj = dom;
  });
  let parser = new htmlparser.Parser(handler);

  parser.write(rawHtml);
  parser.done();
  console.log(htmlObj);

  if (htmlObj.length) {
    for (let _i = 0; _i < htmlObj.length; _i++) {
      console.log(htmlObj[_i].name);
      if (htmlObj[_i].children.length) {
        for (let i = 0; i < htmlObj[_i].children.length; i++) {
          console.log('  ' + htmlObj[_i].children[i].name);
          if (htmlObj[_i].children[i].children.length) {
            for (let j = 0; j < htmlObj[_i].children[i].children.length; j++) {
              console.log('    ' + htmlObj[_i].children[i].children[j].name);
            }
          }
        }
      }
    }
  }
};
