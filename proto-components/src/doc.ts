import * as uuid from 'uuid/v4';

import { Clap } from 'clap';

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
    }, {
      id: uuid(),
      text: 'Text 3',
      type: null,
      properties: null,
      nodes: [{
        id: uuid(),
        text: 'Text 4',
        type: null,
        properties: null,
        nodes: [],
      }, {
        id: uuid(),
        text: 'Text 5',
        type: null,
        properties: null,
        nodes: [],
      }, {
        id: uuid(),
        text: 'Text 6',
        type: null,
        properties: null,
        nodes: [],
      }],
    }, {
      id: uuid(),
      text: 'Text 7',
      type: null,
      properties: null,
      nodes: [],
    }],
  }, {
    id: uuid(),
    text: 'Text 8',
    type: null,
    properties: null,
    nodes: [],
  }, {
    id: uuid(),
    text: 'Text 9',
    type: null,
    properties: null,
    nodes: [],
  }],
};

export const doc: Clap.Document = new Clap.Document(pureNode);
