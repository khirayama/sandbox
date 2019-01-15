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

interface INode {
  id: string;
  object: 'document' | 'block' | 'text';
  type: 'paragraph' | null;
  nodes: INode[] | null;
}

class SuperNode implements INode {
  public id: string = uuid();

  public object: 'document' | 'block' | 'text';

  public type: 'paragraph' | null;

  public nodes: INode[] | null;

  constructor(pureNode: INode) {
    this.id = pureNode.id;
    this.object = pureNode.object;
    this.type = pureNode.type;
    this.nodes = [];
  }
}

/* ------- Text Node ----------- */
class TextNode extends SuperNode {
  public text: string;

  constructor(pureNode: INode) {
    super(pureNode);

    this.object = 'text';
    this.type = null;
    this.nodes = null;
    this.text = '';
  }
}

/* ------- Block Node ----------- */
class BlockNode extends SuperNode {
  constructor(pureNode: INode) {
    super(pureNode);

    this.object = 'block';
    this.type = null;
    this.nodes = [];
  }
}
/* ------- Document Node ----------- */
class DocumentNode extends SuperNode {
  constructor(pureNode: INode) {
    super(pureNode);

    this.object = 'document';
    this.type = null;
    this.nodes = [];
  }
}

function createNodeFromPureNode(rootPureNode: INode): INode {
  let rootNode: DocumentNode | BlockNode | TextNode;

  if (rootPureNode.object === 'document') {
    rootNode = new DocumentNode(rootPureNode);
  } else if (rootPureNode.object === 'block') {
    rootNode = new BlockNode(rootPureNode);
  } else if (rootPureNode.object === 'text') {
    rootNode = new TextNode(rootPureNode);
  }

  if (rootPureNode.nodes !== null) {
    for (const pureNode of rootPureNode.nodes) {
      rootNode.nodes.push(createNodeFromPureNode(pureNode));
    }
  }

  return rootNode;
}

function createPureNodeFromNode(rootNode: INode): INode {
  const rootPureNode: INode = {
    id: rootNode.id,
    object: rootNode.object,
    type: rootNode.type,
    nodes: rootNode.nodes,
  };

  if (rootNode.nodes !== null) {
    for (const node of rootNode.nodes) {
      rootPureNode.nodes.push(createPureNodeFromNode(node));
    }
  }

  return rootPureNode;
}

/* ------- Traverse ----------- */
export class Traverse {
  private tree: TDocumentNode;

  constructor(tree?: TDocumentNode) {
    this.tree = tree || this.initTree();
  }

  public getTree(): TDocumentNode {
    return this.tree;
  }

  public findNode(id: string, rootNode: TDocumentNode | TBlockNode | TTextNode = this.tree): TDocumentNode | TBlockNode | TTextNode | null {
    // FYI: とりあえず深さ優先探索。Browserは参考にできそう
    if (rootNode.id === id) {
      return rootNode;
    } else if ((<TDocumentNode | TBlockNode>rootNode).nodes) {
      for (const node of (<TDocumentNode | TBlockNode>rootNode).nodes) {
        const res: TDocumentNode | TBlockNode | TTextNode | null = this.findNode(id, node);
        if (res !== null) {
          return res;
        }
      }
    }

    return null;
  }

  public updateText(id: string, text: string): void {
    const node: TDocumentNode | TBlockNode | TTextNode | null = this.findNode(id);
    if  (node !== null && (<TTextNode>node).text) {
      (<TTextNode>node).text = text;
    }
  }

  private initTree(): TDocumentNode {
    const pad: TDocumentNode = {
      id: uuid(),
      nodes: [
        this.createTextBlock(),
        this.createTextBlock(),
        this.createTextBlock(),
      ],
    };

    pad.nodes[1].nodes.push(this.createTextBlock());
    pad.nodes[1].nodes[0].nodes.push(this.createTextBlock());
    pad.nodes[1].nodes.push(this.createTextBlock());

    return pad;
  }

  private createTextBlock(): TBlockNode {
    return {
      id: uuid(),
      type: 'TEXT',
      nodes: [{
        id: uuid(),
        text: 'text',
      }],
    };
  }
}
