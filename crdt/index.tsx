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

const ydocS = new Y.Doc();
const yarrayS: Y.Array<number> = ydocS.getArray("my array type");
yarrayS.insert(0, [1, 2, 3, 4, 5]);

const ydocA = new Y.Doc();
Y.applyUpdate(ydocA, Y.encodeStateAsUpdate(ydocS));
const yarrayA: Y.Array<number> = ydocA.getArray("my array type");

const ydocB = new Y.Doc();
Y.applyUpdate(ydocB, Y.encodeStateAsUpdate(ydocA));
const yarrayB: Y.Array<number> = ydocB.getArray("my array type");

sort(yarrayA, (a, b) => b - a);

yarrayB.insert(0, [6]);
yarrayB.insert(3, [7]);

const updateB = Y.encodeStateAsUpdate(ydocB);
Y.applyUpdate(ydocS, updateB);

const updateA = Y.encodeStateAsUpdate(ydocA);
Y.applyUpdate(ydocS, updateA);

Y.applyUpdate(ydocB, Y.encodeStateAsUpdate(ydocS));
Y.applyUpdate(ydocA, Y.encodeStateAsUpdate(ydocS));

console.log(yarrayA.toJSON());
console.log(yarrayB.toJSON());
