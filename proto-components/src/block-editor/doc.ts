import * as uuid from 'uuid/v4';

import { Clap } from 'block-editor/traverse';

const pureNode: Clap.INode = {
  id: uuid(),
  text: null,
  type: null,
  properties: null,
  nodes: [{
    id: uuid(),
    text: 'Text 0',
    type: null,
    properties: null,
    nodes: [],
  }, {
    id: uuid(),
    text: 'Text 1',
    type: null,
    properties: null,
    nodes: [{
      id: uuid(),
      text: 'Text 2',
      type: null,
      properties: null,
      nodes: [],
    }],
  }],
};

export const doc: Clap.Document = new Clap.Document(pureNode);
