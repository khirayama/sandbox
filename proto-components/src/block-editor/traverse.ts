// tslint:disable
import * as uuid from 'uuid/v4';

/*
 * Document
 * Block
 */

/* ------- Block ----------- */
type TBlock = {
  id: string;
};

type TTextBlock = TBlock & {
  type: 'TEXT';
  text: string;
  children: TTextBlock[];
};

/* ------- Pad ----------- */
export type TPad = {
  id: string;
  children: TTextBlock[];
};

/* ------- traverse ----------- */
export const traverse = {
  initPad: (): TPad => {
    const pad: TPad = {
      id: uuid(),
      children: [
        traverse.createTextBlock(),
        traverse.createTextBlock(),
        traverse.createTextBlock(),
      ],
    };

    pad.children[1].children.push(traverse.createTextBlock());
    pad.children[1].children[0].children.push(traverse.createTextBlock());
    pad.children[1].children.push(traverse.createTextBlock());

    return pad;
  },
  createTextBlock: (): TTextBlock => {
    return {
      id: uuid(),
      type: 'TEXT',
      text: 'text',
      children: [],
    };
  },
  updateText: (id: string, text: string) => {
    console.log(id, text);
  },
};

export class Traverse {
  private node: TPad;

  constructor(node?: TPad) {
    // blockTreeが適切か
    this.node = node || this.initNode();
  }

  public getNode(): TPad {
    return this.node;
  }

  public findBlock(id: string, node: TTextBlock[] = this.node.children): TTextBlock | null {
    for (const block of node) {
      if (block.id === id) {
        return block;
      } else if (block.children) {
        const res: TTextBlock | null = this.findBlock(id, block.children);
        if (res !== null) {
          return res;
        }
      }
    }

    return null;
  }

  public updateText(id: string, text: string): void {
    const block: TTextBlock = this.findBlock(id);
    block.text = text;
  }

  private initNode(): TPad {
    const pad: TPad = {
      id: uuid(),
      children: [
        this.createTextBlock(),
        this.createTextBlock(),
        this.createTextBlock(),
      ],
    };

    pad.children[1].children.push(this.createTextBlock());
    pad.children[1].children[0].children.push(this.createTextBlock());
    pad.children[1].children.push(this.createTextBlock());

    return pad;
  }

  private createTextBlock(): TTextBlock {
    return {
      id: uuid(),
      type: 'TEXT',
      text: 'text',
      children: [],
    };
  }
}
