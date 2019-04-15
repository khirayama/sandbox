// tslint:disable
import * as uuid from 'uuid/v4';

/*
 * Ref: https://ja.wikipedia.org/wiki/%E6%9C%A8%E6%A7%8B%E9%80%A0_(%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0)
 * Ref: https://docs.slatejs.org/guides/data-model
 * Tree: NodeとEdgeの集合
 * Nodeの種類
 *  - Document Node(Line Nodenのみ持てる. Top-Level Node)
 *  - Line Node(BlockとTextを持てる)
 *  - Text Node(stringのみを持つ)
 * PureNode: JSON Object
 * Node: Instance
 */

export namespace Clap {
  type Style = {
    type: 'bold' | 'italic' | 'link' | null;
    properties?: any;
  };

  export type PureChar = {
    id: string;
    char: string;
    styles: Style[];
  };

  export type PureLine = {
    id: string;
    text: PureChar[];
    type: string | null;
    properties?: any;
  };

  export type PureDocument = {
    id: string;
    name: string;
    lines: PureLine[];
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

  export class Char {
    public id: string;

    public char: string;

    public styles: Style[];

    constructor(pureChar: PureChar) {
      this.id = pureChar ? pureChar.id : uuid();
      this.char = pureChar ? pureChar.char : '';
      this.styles = pureChar ? pureChar.styles : [];
    }

    public toJSON(): PureChar {
      return {
        id: this.id,
        char: this.char,
        styles: this.styles,
      };
    }
  }

  export class Line {
    public id: string;

    public text: Char[];

    public type: string | null;

    public properties: any;

    private listeners: ((event: ChangeEvent) => void)[] = [];

    constructor(pureLine?: PureLine) {
      this.id = pureLine ? pureLine.id : uuid();
      this.text = pureLine ? pureLine.text.map((pureChar) => new Char(pureChar)) : [];
      this.type = pureLine ? pureLine.type : null;
      this.properties = pureLine ? pureLine.properties : null;
    }

    public toJSON(): PureLine {
      const pureLine: PureLine = {
        id: this.id,
        text: this.text.map((char: Char) => char.toJSON()),
        type: this.type,
        properties: this.properties,
      };

      return pureLine;
    }
  }

  export class Document {
    public id: string;

    public name: string;

    public lines: Line[];

    constructor(pureDocument?: PureDocument) {
      this.id = pureDocument ? pureDocument.id : uuid();
      this.name = pureDocument ? pureDocument.name : '';
      this.lines = pureDocument ? pureDocument.lines.map((pureLine: PureLine) => new Line(pureLine)) : [];
    }
  }
}
