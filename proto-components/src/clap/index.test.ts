import * as uuid from 'uuid/v4';

import { Clap } from './index';

describe('Clap', () => {
  /* ---------------- Node ------------------ */
  describe('Node', () => {
    it('Create Node instance without pureNode', () => {
      const node: Clap.Node = new Clap.Node();
      expect(node.id).not.toBeFalsy();
      expect(node.text).toEqual('');
      expect(node.type).toBeNull();
      expect(node.nodes.length).toBe(0);
    });
    it('Create Node instance with pureNode', () => {
      const pureNode: Clap.INode = {
        id: uuid(),
        text: 'Hello World',
        type: null,
        properties: null,
        nodes: [],
      };
      const node: Clap.Node = new Clap.Node(pureNode);
      expect(node.id).toBe(pureNode.id);
      expect(node.text).toEqual('Hello World');
      expect(node.type).toBeNull();
      expect(node.properties).toBeNull();
      expect(node.nodes.length).toBe(0);
      expect(node["parentNode"]).toBeNull();
    });
    it('Create Node instance with pureNode has child nodes', () => {
      const pureNode: Clap.INode = {
        id: uuid(),
        text: 'Hello',
        type: null,
        properties: null,
        nodes: [{
          id: uuid(),
          text: 'World',
          type: null,
          properties: null,
          nodes: [],
        }],
      };
      const node: Clap.Node = new Clap.Node(pureNode);
      expect(node.id).toBe(pureNode.id);
      expect(node.text).toEqual('Hello');
      expect(node.type).toBeNull();
      expect(node.properties).toBeNull();
      expect(node.nodes.length).toBe(1);
      expect(node["parentNode"]).toBeNull();
      expect(node.nodes[0].id).toBe(pureNode.nodes[0].id);
      expect(node.nodes[0].text).toEqual('World');
      expect(node.nodes[0].type).toBeNull();
      expect(node.nodes[0].properties).toBeNull();
      expect(node.nodes[0].nodes.length).toBe(0);
      expect(node.nodes[0]["parentNode"].id).toBe(pureNode.id);
    });
    describe('toPureNode', () => {
      it('Create Node instance with pureNode has child nodes', () => {
        const pureNode: Clap.INode = {
          id: uuid(),
          text: 'Hello',
          type: null,
          properties: null,
          nodes: [{
            id: uuid(),
            text: 'World',
            type: null,
            properties: null,
            nodes: [],
          }],
        };
        const node: Clap.Node = new Clap.Node(pureNode);
        const newPureNode: Clap.INode = node.toPureNode();
        expect(newPureNode).toEqual(pureNode);
      });
    });
  });
});
