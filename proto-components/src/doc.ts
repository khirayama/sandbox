import * as uuid from 'uuid/v4';

import { Clap } from 'clap';

const pureNode: Clap.INode = {
  id: uuid(),
  text: null,
  properties: null,
  nodes: [{
    id: uuid(),
    text: 'Text 0',
    properties: null,
    nodes: [],
  }, {
    id: uuid(),
    text: 'Text 1',
    properties: null,
    nodes: [{
      id: uuid(),
      text: 'Text 2',
      properties: null,
      nodes: [],
    }, {
      id: uuid(),
      text: 'Text 3',
      properties: null,
      nodes: [{
        id: uuid(),
        text: 'Text 4',
        properties: null,
        nodes: [],
      }, {
        id: uuid(),
        text: 'Text 5',
        properties: null,
        nodes: [],
      }, {
        id: uuid(),
        text: 'Text 6',
        properties: null,
        nodes: [],
      }],
    }, {
      id: uuid(),
      text: 'Text 7',
      properties: null,
      nodes: [],
    }],
  }, {
    id: uuid(),
    text: 'Text 8',
    properties: null,
    nodes: [],
  }, {
    id: uuid(),
    text: 'Text 9',
    properties: null,
    nodes: [],
  }],
};

export const doc: Clap.Document = new Clap.Document(pureNode);
