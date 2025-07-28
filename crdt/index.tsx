import * as Y from "yjs";

function sort(
  yarray: Y.Array<number>,
  compareFn?: (a: number, b: number) => number
): void {
  const arr = yarray.toArray();
  arr.sort(compareFn);
  for (let i = arr.length - 1; i >= 0; i--) {
    yarray.delete(i);
    yarray.insert(i, [arr[i]]);
  }
}

const ydocA = new Y.Doc();
const yarrayA: Y.Array<number> = ydocA.getArray("my array type");
yarrayA.insert(0, [1, 2, 3, 4, 5]);

const ydocB = new Y.Doc();
Y.applyUpdate(ydocB, Y.encodeStateAsUpdate(ydocA));
const yarrayB: Y.Array<number> = ydocB.getArray("my array type");

sort(yarrayA, (a, b) => b - a);
console.log(yarrayA.toJSON());

yarrayB.insert(0, [6]);
yarrayB.insert(3, [7]);
console.log(yarrayB.toJSON());

const updateB = Y.encodeStateAsUpdate(ydocB);
Y.applyUpdate(ydocA, updateB);

const updateA = Y.encodeStateAsUpdate(ydocA);
Y.applyUpdate(ydocB, updateA);

console.log(yarrayA.toJSON());
console.log(yarrayB.toJSON());
