import * as Y from "yjs";

class CRDTSortableList {
  constructor(ydoc) {
    this.doc = ydoc;
    this.items = ydoc.getArray("items");
    this.operations = ydoc.getArray("operations");
  }

  initialize(values) {
    this.items.delete(0, this.items.length);
    this.items.push(
      values.map((value, index) => ({
        id: `item-${value}-${Date.now()}-${index}`,
        value,
      }))
    );
  }

  sort(compareFn) {
    const timestamp = Date.now();
    const currentItems = this.items.toArray();
    const sorted = [...currentItems].sort((a, b) =>
      compareFn(a.value, b.value)
    );

    this.operations.push([
      {
        type: "sort",
        timestamp,
        sortedIds: sorted.map((item) => item.id), // ソート後の順序を記録
      },
    ]);

    this.items.delete(0, this.items.length);
    this.items.push(sorted);
  }

  move(value, targetIndex) {
    const timestamp = Date.now();
    const currentItems = this.items.toArray();

    const currentIndex = currentItems.findIndex((item) => item.value === value);
    if (currentIndex === -1) {
      console.error(`Item with value ${value} not found`);
      return;
    }

    const item = currentItems[currentIndex];

    this.operations.push([
      {
        type: "move",
        timestamp,
        itemId: item.id,
        fromIndex: currentIndex,
        toIndex: targetIndex,
      },
    ]);

    // 実際に移動
    this.items.delete(currentIndex, 1);
    const adjustedIndex =
      currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    this.items.insert(adjustedIndex, [item]);
  }

  computeFinalOrder() {
    const allOps = this.operations
      .toArray()
      .sort((a, b) => a.timestamp - b.timestamp);

    const lastSortOp = allOps.filter((op) => op.type === "sort").pop();

    if (!lastSortOp) {
      return this.items.toArray().map((item) => item.value);
    }

    const sortedIds = lastSortOp.sortedIds;
    const itemMap = new Map(
      this.items.toArray().map((item) => [item.id, item])
    );

    let result = sortedIds
      .map((id) => itemMap.get(id))
      .filter((item) => item !== undefined);

    const moveOpsAfterSort = allOps
      .filter((op) => op.type === "move" && op.timestamp > lastSortOp.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);

    moveOpsAfterSort.forEach((moveOp) => {
      const itemIndex = result.findIndex((item) => item.id === moveOp.itemId);
      if (itemIndex !== -1) {
        const [item] = result.splice(itemIndex, 1);
        result.splice(moveOp.toIndex, 0, item);
      }
    });

    return result.map((item) => item.value);
  }

  getValues() {
    return this.items.toArray().map((item) => item.value);
  }
}

async function demonstrateCorrectUsage() {
  const docA = new Y.Doc();
  const docB = new Y.Doc();

  const listA = new CRDTSortableList(docA);
  const listB = new CRDTSortableList(docB);

  listA.initialize([1, 2, 3, 4, 5]);
  console.log("初期状態:", listA.getValues());

  listA.sort((a, b) => b - a);
  console.log("User Aソート後:", listA.getValues());

  listB.move(3, 0);
  console.log("User B移動後（生データ）:", listB.getValues());

  // console.log("最終結果（計算値）:", listB.computeFinalOrder());
  Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB));
  Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));

  console.log("User A最終結果:", listA.computeFinalOrder());
  console.log("User A getValues:", listA.getValues());
  console.log("User B最終結果:", listB.computeFinalOrder());
  console.log("User B getValues:", listB.getValues());
}

demonstrateCorrectUsage();
