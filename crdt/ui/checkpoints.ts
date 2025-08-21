/*
- APIはcheckpointsとoperationsを返す
- checkpointsはversion(operationの回数)とhashとvalueを持つ
- 登場人物メモ
  - 初期化エンドポイント
  - 更新エンドポイント
  - 最新checkpoint
  - 初期化checkpoint
  - 有効checkpoint
  - ローカルcheckpoints
  - リモートcheckpoints
  - ローカルoperations
  - リモートoperations
- フローで整理
  - 初期化時
    - クライアント
      - 初期化エンドポイントにリクエスト
    - サーバ
      - 過去分全てのcheckpointsと最新checkpoint以降のリモートoperationsを返す
    - クライアント
      - 最新checkpointとoperationsでデータを復元
      - この時の最新checkpointを初期化checkpointおよび有効checkpointとする
  - 更新・同期
    - クライアント
      - 有効checkpointと以降のローカルoperationsを更新エンドポイントにリクエスト
    - サーバ
      - 有効checkpoint以降のリモートoperationsを取得
      - リモートoperationsとローカルoperationsとマージ
      - checkpointsを更新
      - 更新された有効checkpoint同等のcheckpointとそれ以降のマージ済みリモートoperationsを返す
        - checkpointにversionが必要
    - クライアント
      - ローカルでローカルoperationsとリモートoperationsをマージ
      - ローカルcheckpointを更新された有効checkpoint同等のcheckpointに更新
      - 初期化のcheckpoint以降のマージ済みローカルoperationsでcheckpointを作成
      - レスポンスに含まれるcheckpointと計算済みcheckpointを比較し、同じだった場合、有効checkpointとする
      - 有効checkpoint以降のマージ済みローカルoperationsでデータを復元
 */

import { v7 as uuid } from "uuid";
import sum from "hash-sum";

const opesBase = [];
for (let i = 0; i < 1000; i++) {
  opesBase.push({
    id: uuid(),
    name: `Operation ${opesBase.length}`,
  });
}

const opesA = [...opesBase];
for (let i = 0; i < 100; i++) {
  opesA.push({
    id: uuid(),
    name: `Operation ${opesA.length}`,
  });
}

const opesB = [...opesBase];
for (let i = 0; i < 100; i++) {
  opesB.push({
    id: uuid(),
    name: `Operation ${opesB.length}`,
  });
}

function makeCheckpoints(opes) {
  const checkpoints = [];
  for (let i = 0; i < opes.length; i++) {
    // apply op
    if (i % 100 === 0) {
      const hash = sum(opes.slice(i, i + 100));
      checkpoints.push({
        version: i,
        hash,
        value: `this is checkpoint ${i}`,
      });
    }
  }
  return checkpoints;
}

const checkpointsA = makeCheckpoints(opesA);
const checkpointsB = makeCheckpoints(opesB);
console.log(checkpointsA);
console.log(checkpointsB);

// console.log(sum);
//
// console.log(sum(["aa", "bb"]));
// console.log(sum(["aa", "bb", "cc"]));
// console.log(sum(["aa", "bb"]));
// console.log(sum(["bb", "aa"]));
