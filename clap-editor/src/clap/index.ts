// tslint:disable
import * as uuid from 'uuid/v4';

/*
 * Ref: https://ja.wikipedia.org/wiki/%E6%9C%A8%E6%A7%8B%E9%80%A0_(%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0)
 * Ref: https://docs.slatejs.org/guides/data-model
 * Tree: NodeとEdgeの集合
 * Nodeの種類
 *  - Document Node(Block Nodenのみ持てる. Top-Level Node)
 *  - Block Node
 * PureNode: JSON Object
 * Node: Instance
 */

export namespace Clap {
  export type PureBlock = {
    id: string;
    text: string;
    type: string | null;
    indent: number;
    properties?: any;
  };

  export type PureDocument = {
    id: string;
    name: string;
    blocks: PureBlock[];
  };

  export class ChangeEvent {
    // Eventが発生したNode
    public target: Node;

    // Event Listenerが貼られたNode
    public currentTarget: Node;

    constructor(target: Node, currentTarget: Node) {
      this.target = target;
      this.currentTarget = currentTarget;
    }
  }

  export class Block {
    public id: string;

    public text: string;

    public indent: number;

    public type: string | null;

    public properties: any;

    private listeners: ((event: ChangeEvent) => void)[] = [];

    constructor(pureBlock?: PureBlock) {
      this.id = pureBlock ? pureBlock.id : uuid();
      this.text = pureBlock ? pureBlock.text : '';
      this.indent = pureBlock ? pureBlock.indent : 0;
      this.type = pureBlock ? pureBlock.type : null;
      this.properties = pureBlock ? pureBlock.properties : null;
    }

    public toPureBlock(): PureBlock {
      const pureBlock: PureBlock = {
        id: this.id,
        text: this.text,
        indent: this.indent,
        type: this.type,
        properties: this.properties,
      };

      return pureBlock;
    }
  }

  export class Document {
    public id: string;

    public name: string;

    public blocks: Block[];

    constructor(pureDocument?: PureDocument) {
      this.id = pureDocument ? pureDocument.id : uuid();
      this.name = pureDocument ? pureDocument.name : '';
      this.blocks = pureDocument ? pureDocument.blocks.map((pureBlock: PureBlock) => new Block(pureBlock)) : [];
    }

    public toPureDocument(): PureDocument {
      return {
        id: this.id,
        name: this.name,
        blocks: this.blocks.map((block) => block.toPureBlock()),
      };
    }

    public addChangeListener(callback: any): void {
      // noop
    }
  }
}
