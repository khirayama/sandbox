class CRDTSortableList {
  constructor() {
    this.items = [];
    this.operations = [];
  }

  initialize(values) {
    this.items = values.map((value, index) => ({
      id: `item-${value}-${index}`,
      value,
    }));
  }

  sort(compareFn) {
    const timestamp = Date.now();
    const currentItems = [...this.items];
    const sorted = [...currentItems].sort((a, b) =>
      compareFn(a.value, b.value)
    );

    this.operations.push({
      type: "sort",
      timestamp,
      sortedIds: sorted.map((item) => item.id), // ソート後の順序を記録
    });

    this.items = sorted;
  }

  move(value, targetIndex) {
    const timestamp = Date.now();
    const currentItems = [...this.items];

    const currentIndex = currentItems.findIndex((item) => item.value === value);
    if (currentIndex === -1) {
      console.error(`Item with value ${value} not found`);
      return;
    }

    const item = currentItems[currentIndex];

    this.operations.push({
      type: "move",
      timestamp,
      itemId: item.id,
      fromIndex: currentIndex,
      toIndex: targetIndex,
    });

    // 実際に移動
    this.items.splice(currentIndex, 1);
    const adjustedIndex =
      currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
    this.items.splice(adjustedIndex, 0, item);
  }

  computeFinalOrder() {
    const allOps = [...this.operations]
      .sort((a, b) => a.timestamp - b.timestamp);

    const lastSortOp = allOps.filter((op) => op.type === "sort").pop();

    if (!lastSortOp) {
      return this.items.map((item) => item.value);
    }

    const sortedIds = lastSortOp.sortedIds;
    const itemMap = new Map(
      this.items.map((item) => [item.id, item])
    );

    let result = sortedIds
      .map((id) => itemMap.get(id))
      .filter((item) => item !== undefined);

    const moveOpsAfterSort = allOps
      .filter((op) => op.type === "move" && op.timestamp >= lastSortOp.timestamp)
      .sort((a, b) => a.timestamp - b.timestamp);

    moveOpsAfterSort.forEach((moveOp) => {
      const itemIndex = result.findIndex((item) => item.id === moveOp.itemId);
      if (itemIndex !== -1) {
        const [item] = result.splice(itemIndex, 1);
        // ソート後の配列サイズに対してインデックスを調整
        const adjustedToIndex = Math.min(moveOp.toIndex, result.length);
        result.splice(adjustedToIndex, 0, item);
      }
    });

    return result.map((item) => item.value);
  }

  getValues() {
    return this.items.map((item) => item.value);
  }

  getState() {
    return {
      items: [...this.items],
      operations: [...this.operations]
    };
  }

  applyState(otherState) {
    // 他のインスタンスの操作をマージ
    const combinedOps = [...this.operations, ...otherState.operations];
    
    // タイムスタンプでソートして重複を削除
    const uniqueOps = combinedOps
      .filter((op, index, arr) => {
        return arr.findIndex(o => {
          if (o.timestamp !== op.timestamp || o.type !== op.type) return false;
          
          // 操作の詳細内容も比較
          if (op.type === 'sort') {
            return JSON.stringify(o.sortedIds) === JSON.stringify(op.sortedIds);
          } else if (op.type === 'move') {
            return o.itemId === op.itemId && o.fromIndex === op.fromIndex && o.toIndex === op.toIndex;
          }
          
          return true;
        }) === index;
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    
    this.operations = uniqueOps;
    
    // 他のインスタンスのitemsをマージ
    const allItems = new Map();
    [...this.items, ...otherState.items].forEach(item => {
      allItems.set(item.id, item);
    });
    
    this.items = Array.from(allItems.values());
  }
}

async function demonstrateCorrectUsage() {
  const listA = new CRDTSortableList();
  const listB = new CRDTSortableList();

  listA.initialize([1, 2, 3, 4, 5]);
  listB.initialize([1, 2, 3, 4, 5]);
  console.log("初期状態:", listA.getValues());

  listA.sort((a, b) => b - a);
  console.log("User Aソート後:", listA.getValues());

  listB.move(3, 0);
  console.log("User B移動後（生データ）:", listB.getValues());

  // 状態同期
  const stateA = listA.getState();
  const stateB = listB.getState();
  listA.applyState(stateB);
  listB.applyState(stateA);

  console.log("User A最終結果:", listA.computeFinalOrder());
  console.log("User B最終結果:", listB.computeFinalOrder());
}

demonstrateCorrectUsage();
