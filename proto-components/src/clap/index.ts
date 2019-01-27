// tslint:disable
import * as uuid from 'uuid/v4';

/*
 * Ref: https://ja.wikipedia.org/wiki/%E6%9C%A8%E6%A7%8B%E9%80%A0_(%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0)
 * Ref: https://docs.slatejs.org/guides/data-model
 * Tree: NodeとEdgeの集合
 * Nodeの種類
 *  - Document Node(Block Nodenのみ持てる. Top-Level Node)
 *  - Block Node(BlockとTextを持てる)
 *  - Text Node(stringのみを持つ)
 * PureNode: JSON Object
 * Node: Instance
 */

/*
interface INode {
  id: string;
  object: 'document' | 'block' | 'text';
  type: 'paragraph' | null;
  nodes: INode[] | null;
}
という構造もやったけど、ちょっと違うな。きっとデータ構造的には正しそうだけど、汎用性の高さよりもアプリケーションの要件をちゃんとモデルにした方がいい気がした。
あくまでItemベースであり、Documentでありつつ、Itemベースのツリー構造である。という意識は必要そう。
変化は基本的に挿入位置と単体に加える。というイメージがただしそう。標準API（標準APIは木構造の一般的な操作として）にしたがって行う。
表示モードと編集モードがあると思って良い。Markdown Block的な考え。
*/

// TODO: typeはpropertiesに入れるべきかも
export namespace Clap {
  export interface INode {
    id: string;
    text: string | null;
    properties?: {
      type: string | null;
    };
    nodes: INode[] | null;
  }

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

  export class Node implements INode {
    public id: string;

    public text: string;

    public type: string | null;

    public properties: any;

    public nodes: Node[] | null;

    private listeners: ((event: ChangeEvent) => void)[] = [];

    public parentNode: Node | null;

    constructor(pureNode?: INode, parentNode: Node | null = null) {
      this.id = pureNode ? pureNode.id : uuid();
      this.text = pureNode ? pureNode.text : '';
      this.properties = pureNode ? pureNode.properties : null;
      this.nodes = pureNode ? pureNode.nodes === null ? null : pureNode.nodes.map((pureChildNode: INode) => new Node(pureChildNode, this)) : [];

      this.parentNode = parentNode;
    }

    // Utils
    public toPureNode(rootNode: Node = this): INode {
      const rootPureNode: INode = {
        id: rootNode.id,
        text: rootNode.text,
        properties: rootNode.properties,
        nodes: rootNode.nodes,
      };

      if (rootNode.nodes !== null) {
        for (const node of rootNode.nodes) {
          rootPureNode.nodes = rootNode.nodes.map(this.toPureNode.bind(this));
        }
      }

      return rootPureNode;
    }

    // Traverse
    public findNode(id: string, rootNode: Node = this): Node | null {
      // FYI: とりあえず深さ優先探索。Browserは参考にできそう
      if (rootNode.id === id) {
        return rootNode;
      } else if (rootNode.nodes) {
        for (const node of rootNode.nodes) {
          const res: Node | null = this.findNode(id, node);
          if (res !== null) {
            return res;
          }
        }
      }

      return null;
    }

    public findPrevNode(): Node | null {
      if (this.parentNode) {
        for (let i: number = 0; i < this.parentNode.nodes.length; i += 1) {
          const node: Node = this.parentNode.nodes[i];
          if (node.id === this.id) {
            return this.parentNode.nodes[i - 1] || null;
          }
        }
      }

      return null;
    }

    public findNextNode(): Node | null {
      if (this.parentNode) {
        for (let i: number = 0; i < this.parentNode.nodes.length; i += 1) {
          const node: Node = this.parentNode.nodes[i];
          if (node.id === this.id) {
            return this.parentNode.nodes[i + 1] || null;
          }
        }
      }

      return null;
    }

    public appendNode(node: Node): void {
      if (node.parentNode) {
        node.parentNode.removeNode(node.id);
      }
      node.parentNode = this;
      this.nodes.push(node);

      this.dispatchChange(this);
    }

    public removeNode(id: string, rootNode: Node = this): void {
      for (let i: number = 0; i < rootNode.nodes.length; i += 1) {
        const node: Node = rootNode.nodes[i];

        if (node.id === id) {
          rootNode.nodes.splice(i, 1);
          this.dispatchChange(this);
          break;
        } else if (node.nodes) {
          for (const node of rootNode.nodes) {
            this.removeNode(id, node);
          }
        }
      }
    }

    public before(node: Node): void {
      if (this.parentNode) {
        node.parentNode.removeNode(node.id);
        node.parentNode = this.parentNode;

        for (let i: number = 0; this.parentNode.nodes.length; i += 1) {
          if (this.id === this.parentNode.nodes[i].id) {
            this.parentNode.nodes.splice(i, 0, node);
            this.dispatchChange(this);
            break;
          }
        }
      }
    }

    public after(node: Node): void {
      if (this.parentNode) {
        if (node.parentNode) {
          node.parentNode.removeNode(node.id);
        }
        node.parentNode = this.parentNode;

        for (let i: number = 0; this.parentNode.nodes.length; i += 1) {
          if (this.id === this.parentNode.nodes[i].id) {
            this.parentNode.nodes.splice(i + 1, 0, node);
            this.dispatchChange(this);
            break;
          }
        }
      }
    }

    // Command
    public updateText(text): void {
      this.text = text;

      this.dispatchChange(this);
    }

    // Event Listeners
    public addChangeListener(listener: (event: ChangeEvent) => void): void {
      this.listeners.push(listener);
    }

    public dispatchChange(node: Node): void {
      if (this.parentNode) {
        // It's for event propagation
        this.parentNode.dispatchChange(node);
      }

      for (const listener of this.listeners) {
        listener(new ChangeEvent(node, this));
      }
    }
  }

  export class Document {
    public id: string;

    public name: string;

    public rootNode: Node;

    constructor(pureNode?: INode) {
      this.rootNode = new Node(pureNode);
    }
  }

  export class Wrapper {
    private node: Clap.Node;

    constructor(node: Clap.Node) {
      this.node = node;
    }

    public findUpperNode(): Clap.Node | null {
      let upperNode: Clap.Node | null = null;
      let prevNode: Clap.Node | null = this.node.findPrevNode();
      if (prevNode) {
        upperNode = prevNode;
        while (true) {
          if (upperNode && upperNode.nodes && upperNode.nodes.length) {
            upperNode = upperNode.nodes[upperNode.nodes.length - 1];
          } else {
            break;
          }
        }
      } else {
        upperNode = this.node.parentNode;
      }

      return upperNode;
    }

    public findDownerNode(): Clap.Node | null {
      let downerNode: Clap.Node | null = null;
      let nextNode: Clap.Node = this.node.findNextNode();
      if (this.node.nodes && this.node.nodes.length) {
        downerNode = this.node.nodes[0];
      } else if (nextNode) {
        downerNode = nextNode;
      } else {
        downerNode = this.node.parentNode;
        while(true) {
          if (downerNode === null) {
            break;
          } else if (downerNode.findNextNode()) {
            downerNode = downerNode.findNextNode();
            break;
          } else {
            downerNode = downerNode.parentNode;
          }
        }
      }

      return downerNode;
    }
  }

  export const helper = {
    q: (node: Clap.Node) => {
      return new Wrapper(node);
    },
  };
}

/* ------- Traverse ----------- */
// export class Traverse {
//   private tree: TDocumentNode;
//
//   constructor(tree?: TDocumentNode) {
//     this.tree = tree || this.initTree();
//   }
//
//   public getTree(): TDocumentNode {
//     return this.tree;
//   }
//
//   public findNode(id: string, rootNode: TDocumentNode | TBlockNode | TTextNode = this.tree): TDocumentNode | TBlockNode | TTextNode | null {
//     // FYI: とりあえず深さ優先探索。Browserは参考にできそう
//     if (rootNode.id === id) {
//       return rootNode;
//     } else if ((<TDocumentNode | TBlockNode>rootNode).nodes) {
//       for (const node of (<TDocumentNode | TBlockNode>rootNode).nodes) {
//         const res: TDocumentNode | TBlockNode | TTextNode | null = this.findNode(id, node);
//         if (res !== null) {
//           return res;
//         }
//       }
//     }
//
//     return null;
//   }
//
//   public updateText(id: string, text: string): void {
//     const node: TDocumentNode | TBlockNode | TTextNode | null = this.findNode(id);
//     if  (node !== null && (<TTextNode>node).text) {
//       (<TTextNode>node).text = text;
//     }
//   }
//
//   private initTree(): TDocumentNode {
//     const pad: TDocumentNode = {
//       id: uuid(),
//       nodes: [
//         this.createTextBlock(),
//         this.createTextBlock(),
//         this.createTextBlock(),
//       ],
//     };
//
//     pad.nodes[1].nodes.push(this.createTextBlock());
//     pad.nodes[1].nodes[0].nodes.push(this.createTextBlock());
//     pad.nodes[1].nodes.push(this.createTextBlock());
//
//     return pad;
//   }
//
//   private createTextBlock(): TBlockNode {
//     return {
//       id: uuid(),
//       type: 'TEXT',
//       nodes: [{
//         id: uuid(),
//         text: 'text',
//       }],
//     };
//   }
// }
