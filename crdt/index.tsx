import * as Y from "yjs";

function sort(
  yarray: Y.Array<number>,
  compareFn?: (a: number, b: number) => number
): void {
  const arr = yarray.toArray();
  arr.sort(compareFn);
  yarray.doc?.transact(() => {
    for (let i = arr.length - 1; i >= 0; i--) {
      yarray.delete(i);
      yarray.insert(i, [arr[i]]);
    }
    uniqueByValue(yarray);
  });
}

function move(yarray: Y.Array<number>, from: number, to: number): void {
  if (from === to) {
    return;
  }
  yarray.doc?.transact(() => {
    const value = yarray.get(from);
    yarray.delete(from);
    yarray.insert(to, [value]);
    uniqueByValue(yarray);
  });
}

function uniqueByValue(yarray: Y.Array<number>): void {
  // const uniqueIds = new Set<number>();
  // const array = yarray.toArray();
  // for (let i = array.length - 1; i >= 0; i--) {
  //   const item = array[i];
  //   if (uniqueIds.has(item)) {
  //     yarray.delete(i, 1);
  //   } else {
  //     uniqueIds.add(item);
  //   }
  // }
}

const ydocS = new Y.Doc();
const yarrayS: Y.Array<number> = ydocS.getArray("my array type");
yarrayS.insert(0, [1, 2, 3, 4, 5]);
yarrayS.observe(() => uniqueByValue(yarrayS));

const ydocA = new Y.Doc();
Y.applyUpdate(ydocA, Y.encodeStateAsUpdate(ydocS));
const yarrayA: Y.Array<number> = ydocA.getArray("my array type");
yarrayA.observe(() => uniqueByValue(yarrayA));

const ydocB = new Y.Doc();
Y.applyUpdate(ydocB, Y.encodeStateAsUpdate(ydocA));
const yarrayB: Y.Array<number> = ydocB.getArray("my array type");
yarrayB.observe(() => uniqueByValue(yarrayB));

move(yarrayB, 2, 0);
sort(yarrayA, (a, b) => b - a);

// yarrayB.insert(0, [6]);
// yarrayB.insert(3, [7]);

const updateB = Y.encodeStateAsUpdate(ydocB);
// Y.applyUpdate(ydocS, updateB);
Y.applyUpdate(ydocA, updateB);

const updateA = Y.encodeStateAsUpdate(ydocA);
// Y.applyUpdate(ydocS, updateB);
Y.applyUpdate(ydocB, updateA);

// const updateA = Y.encodeStateAsUpdate(ydocA);
// Y.applyUpdate(ydocS, updateA);

// Y.applyUpdate(ydocB, Y.encodeStateAsUpdate(ydocS));
// Y.applyUpdate(ydocA, Y.encodeStateAsUpdate(ydocS));

console.log(yarrayA.toJSON());
console.log(yarrayB.toJSON());
