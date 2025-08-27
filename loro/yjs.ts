import { LoroDoc, LoroMovableList } from "loro-crdt";

function sort(
  yarray: LoroMovableList,
  compareFn?: (a: number, b: number) => number
): void {
  const originalArray = yarray.toJSON() as number[];
  const sortedArray = [...originalArray];
  sortedArray.sort(compareFn);

  // Simple approach: find current index for each target position
  for (let targetPos = 0; targetPos < sortedArray.length; targetPos++) {
    const targetValue = sortedArray[targetPos];
    let currentPos = -1;
    
    // Find where this value currently is
    for (let i = targetPos; i < originalArray.length; i++) {
      if (yarray.get(i) === targetValue) {
        currentPos = i;
        break;
      }
    }
    
    // Move if needed
    if (currentPos !== -1 && currentPos !== targetPos) {
      yarray.move(currentPos, targetPos);
    }
  }
}

function move(yarray: LoroMovableList, from: number, to: number): void {
  if (from === to) {
    return;
  }
  yarray.move(from, to);
}

const ydocS = new LoroDoc();
const yarrayS: LoroMovableList = ydocS.getMovableList("my array type");
[1, 2, 3, 4, 5].forEach((value, index) => yarrayS.insert(index, value));
console.log("初期状態 (ydocS):", yarrayS.toJSON());

const ydocA = new LoroDoc();
ydocA.import(ydocS.export({ mode: "update" }));
const yarrayA: LoroMovableList = ydocA.getMovableList("my array type");
console.log("ydocAにインポート後:", yarrayA.toJSON());

const ydocB = new LoroDoc();
ydocB.import(ydocA.export({ mode: "update" }));
const yarrayB: LoroMovableList = ydocB.getMovableList("my array type");
console.log("ydocBにインポート後:", yarrayB.toJSON());

sort(yarrayA, (a, b) => b - a);
console.log("yarrayAソート後:", yarrayA.toJSON());

move(yarrayB, 2, 0);
console.log("yarrayB移動後:", yarrayB.toJSON());

// yarrayB.insert(0, [6]);
// yarrayB.insert(3, [7]);

const updateB = ydocB.export({ mode: "update" });
console.log("ydocBからupdateBをエクスポート");
// ydocS.import(updateB);
ydocA.import(updateB);
console.log("ydocAにupdateBをインポート後:", yarrayA.toJSON());

const updateA = ydocA.export({ mode: "update" });
console.log("ydocAからupdateAをエクスポート");
// ydocS.import(updateB);
ydocB.import(updateA);
console.log("ydocBにupdateAをインポート後:", yarrayB.toJSON());

// const updateA = ydocA.export({ mode: "update" });
// ydocS.import(updateA);

// ydocB.import(ydocS.export({ mode: "update" }));
// ydocA.import(ydocS.export({ mode: "update" }));

// 期待値: [3,5,4,2,1]
console.log("最終結果 (yarrayA):", yarrayA.toJSON());
console.log("最終結果 (yarrayB):", yarrayB.toJSON());

console.log("\n=== 解決策1: 順次実行パターン (ソート → マージ → move) ===");

// 新しいドキュメントセットを作成
const ydoc1S = new LoroDoc();
const yarray1S: LoroMovableList = ydoc1S.getMovableList("solution1");
[1, 2, 3, 4, 5].forEach((value, index) => yarray1S.insert(index, value));

const ydoc1A = new LoroDoc();
ydoc1A.import(ydoc1S.export({ mode: "update" }));
const yarray1A: LoroMovableList = ydoc1A.getMovableList("solution1");

const ydoc1B = new LoroDoc();
ydoc1B.import(ydoc1S.export({ mode: "update" }));
const yarray1B: LoroMovableList = ydoc1B.getMovableList("solution1");

// Step 1: yarrayAでソート実行
sort(yarray1A, (a, b) => b - a);
console.log("Step 1 - ソート後 (yarray1A):", yarray1A.toJSON());

// Step 2: ソート結果をyarrayBにマージ
const sortedUpdate = ydoc1A.export({ mode: "update" });
ydoc1B.import(sortedUpdate);
console.log("Step 2 - ソート結果マージ後 (yarray1B):", yarray1B.toJSON());

// Step 3: yarrayBでmove実行
move(yarray1B, 2, 0);
console.log("Step 3 - move実行後 (yarray1B):", yarray1B.toJSON());

// Step 4: move結果をyarrayAにマージ
const moveUpdate = ydoc1B.export({ mode: "update" });
ydoc1A.import(moveUpdate);
console.log("解決策1の最終結果 (yarray1A):", yarray1A.toJSON());
console.log("解決策1の最終結果 (yarray1B):", yarray1B.toJSON());

console.log("\n=== 解決策2: 逆順実行パターン (move → マージ → ソート) ===");

// 新しいドキュメントセットを作成
const ydoc2S = new LoroDoc();
const yarray2S: LoroMovableList = ydoc2S.getMovableList("solution2");
[1, 2, 3, 4, 5].forEach((value, index) => yarray2S.insert(index, value));

const ydoc2A = new LoroDoc();
ydoc2A.import(ydoc2S.export({ mode: "update" }));
const yarray2A: LoroMovableList = ydoc2A.getMovableList("solution2");

const ydoc2B = new LoroDoc();
ydoc2B.import(ydoc2S.export({ mode: "update" }));
const yarray2B: LoroMovableList = ydoc2B.getMovableList("solution2");

// Step 1: yarrayBでmove実行
move(yarray2B, 2, 0);
console.log("Step 1 - move後 (yarray2B):", yarray2B.toJSON());

// Step 2: move結果をyarrayAにマージ
const moveUpdate2 = ydoc2B.export({ mode: "update" });
ydoc2A.import(moveUpdate2);
console.log("Step 2 - move結果マージ後 (yarray2A):", yarray2A.toJSON());

// Step 3: yarrayAでソート実行
sort(yarray2A, (a, b) => b - a);
console.log("Step 3 - ソート実行後 (yarray2A):", yarray2A.toJSON());

// Step 4: ソート結果をyarrayBにマージ
const sortedUpdate2 = ydoc2A.export({ mode: "update" });
ydoc2B.import(sortedUpdate2);
console.log("解決策2の最終結果 (yarray2A):", yarray2A.toJSON());
console.log("解決策2の最終結果 (yarray2B):", yarray2B.toJSON());

console.log("\n=== 解決策3: 手動マージパターン（期待値を直接構築） ===");

function manualMerge(): number[] {
  const original = [1, 2, 3, 4, 5];
  
  // Step 1: ソート操作をシミュレート (降順)
  const sorted = [...original].sort((a, b) => b - a); // [5,4,3,2,1]
  
  // Step 2: move操作をシミュレート (index 2 -> 0)
  // 元の配列 [1,2,3,4,5] で index 2 の要素は 3
  // これを先頭に移動すると [3,1,2,4,5]
  
  // 期待される結果: ソート後の配列 [5,4,3,2,1] に対してmove操作を適用
  // インデックス2の要素（3）を先頭に移動
  const result = [...sorted];
  const elementToMove = result[2]; // 3
  result.splice(2, 1); // 3を削除 -> [5,4,2,1]
  result.unshift(elementToMove); // 先頭に3を挿入 -> [3,5,4,2,1]
  
  return result;
}

const expectedResult = manualMerge();
console.log("手動マージによる期待値:", expectedResult);

// 新しいドキュメントで期待値を再現
const ydoc3 = new LoroDoc();
const yarray3: LoroMovableList = ydoc3.getMovableList("solution3");

// 期待値を順番にinsert
expectedResult.forEach((value, index) => yarray3.insert(index, value));

console.log("解決策3の最終結果:", yarray3.toJSON());
