import { Clap } from 'traverse';

class NodeWrapper {
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

export const nodeHelper = {
  q: (node: Clap.Node) => {
    return new NodeWrapper(node);
  },
};
