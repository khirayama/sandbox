import * as uuid from 'uuid/v4';

import { Clap } from 'clap';

const pureNode: Clap.PureDocument = {
  id: uuid(),
  name: null,
  blocks: [{
    id: uuid(),
    text: 'Text 0',
    indent: 0,
    type: null,
    properties: null,
  }, {
    id: uuid(),
    text: 'Text 1',
    indent: 0,
    type: null,
    properties: null,
  }, {
    id: uuid(),
    text: 'Text 2',
    indent: 1,
    type: null,
    properties: null,
  }, {
    id: uuid(),
    text: 'Text 3',
    indent: 0,
    type: null,
    properties: null,
  }],
};

export const doc: Clap.Document = new Clap.Document(pureNode);
