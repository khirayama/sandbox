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
*/

export namespace Clap {
  export interface INode {
    id: string;
    text: string | null;
    type: string | null;
    properties?: any;
    nodes: INode[] | null;
  }

  export class Node implements INode {
    public id: string;

    public text: string;

    public type: string | null;

    public properties: any;

    public nodes: INode[] | null;

    constructor(pureNode?: INode) {
      this.id = pureNode ? pureNode.id : uuid();
      this.text = pureNode ? pureNode.text : '';
      this.type = pureNode ? pureNode.type : null;
      this.properties = pureNode ? pureNode.properties : null;
      this.nodes = pureNode ? pureNode.nodes === null ? null : pureNode.nodes.map((pureChildNode: INode) => new Node(pureChildNode)) : [];
    }

    public toPureNode(rootNode: Node = this): INode {
      const rootPureNode: INode = {
        id: rootNode.id,
        text: rootNode.text,
        type: rootNode.type,
        properties: rootNode.properties,
        nodes: rootNode.nodes,
      };

      if (rootNode.nodes !== null) {
        for (const node of rootNode.nodes) {
          rootPureNode.nodes = rootNode.nodes.map(this.toPureNode);
        }
      }

      return rootPureNode;
    }
  }

  export class Document {
    public id: string;

    public name: string;

    public nodes: INode[];
  }
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
