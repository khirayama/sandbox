// tasklist-demo.tsx
import { LoroDoc, LoroMap, LoroMovableList } from "loro-crdt";

// 型定義
type TaskList = {
  id: string;
  name: string;
  tasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
};

// 擬似DB (PostgreSQL BYTEA の代わり)
const fakeDB: Map<string, Buffer> = new Map();

// サーバーの状態
let serverDoc: LoroDoc | null = null;

// ------------------- Server 側 -------------------

// 初期化
function initServer(docId: string) {
  serverDoc = new LoroDoc();
  const root = serverDoc.getMap("root") as LoroMap;
  root.set("id", docId);
  root.set("name", "New TaskList");
  const tasks = serverDoc.getMovableList("tasks");
  root.set("tasks", tasks);
  saveToDB(docId, serverDoc);
}

// 保存
function saveToDB(docId: string, doc: LoroDoc) {
  const snapshot = doc.save({ shallow: true, gc: true });
  fakeDB.set(docId, Buffer.from(snapshot));
  console.log(`📦 Saved snapshot for ${docId}, size=${snapshot.byteLength} bytes`);
}

// DB から読み込み
function loadFromDB(docId: string): LoroDoc | null {
  const buf = fakeDB.get(docId);
  if (!buf) return null;
  return LoroDoc.load(buf);
}

// クライアントから受信して即マージ & 保存
function receiveFromClient(docId: string, clientDoc: LoroDoc) {
  if (!serverDoc) throw new Error("Server not initialized");
  serverDoc.merge(clientDoc.export());
  saveToDB(docId, serverDoc);
}

// ------------------- Client 側 -------------------

// クライアントが最新状態を取得
function loadClientDoc(docId: string): LoroDoc {
  const snapshot = loadFromDB(docId);
  if (!snapshot) throw new Error("Doc not found in DB");
  return snapshot;
}

// クライアントが編集して送信
function clientEdit(docId: string, editFn: (doc: LoroDoc) => void) {
  const clientDoc = loadClientDoc(docId);
  editFn(clientDoc);
  receiveFromClient(docId, clientDoc);
}

// ------------------- Task 操作用ユーティリティ -------------------

function addTask(doc: LoroDoc, taskId: string, text: string) {
  const tasks = doc.getMovableList("tasks") as LoroMovableList;
  const taskMap = doc.createMap() as LoroMap;
  taskMap.set("id", taskId);
  taskMap.set("text", text);
  taskMap.set("completed", false);
  tasks.push(taskMap);
}

function toggleTask(doc: LoroDoc, taskId: string, completed: boolean) {
  const tasks = doc.getMovableList("tasks") as LoroMovableList;
  for (const t of tasks.toArray() as LoroMap[]) {
    if (t.get("id") === taskId) {
      t.set("completed", completed);
    }
  }
}

function moveTask(doc: LoroDoc, taskId: string, beforeTaskId: string | null) {
  const tasks = doc.getMovableList("tasks") as LoroMovableList;
  const taskEntries = tasks.toArray() as LoroMap[];

  const task = taskEntries.find((t) => t.get("id") === taskId);
  const before = beforeTaskId
    ? taskEntries.find((t) => t.get("id") === beforeTaskId)
    : null;

  if (task) {
    if (before) {
      tasks.moveBefore(task, before);
    } else {
      tasks.push(task); // move to end
    }
  }
}

// 表示用
function dump(doc: LoroDoc): TaskList {
  const root = doc.getMap("root") as LoroMap;
  const tasks = root.get("tasks") as LoroMovableList;
  return {
    id: root.get("id"),
    name: root.get("name"),
    tasks: (tasks.toArray() as LoroMap[]).map((t) => ({
      id: t.get("id"),
      text: t.get("text"),
      completed: t.get("completed"),
    })),
  };
}

// ------------------- Demo -------------------
async function main() {
  const docId = "tasklist-1";

  // Server 初期化
  initServer(docId);

  // UserA: タスク追加 & 名前変更
  clientEdit(docId, (doc) => {
    addTask(doc, "t1", "Buy milk");
    addTask(doc, "t2", "Write report");
    doc.getMap("root").set("name", "UserA's TaskList");
  });

  // UserB: タスク追加 & 完了チェック
  clientEdit(docId, (doc) => {
    addTask(doc, "t3", "Clean desk");
    toggleTask(doc, "t1", true);
  });

  // UserA: 並び替え
  clientEdit(docId, (doc) => {
    moveTask(doc, "t3", "t1");
  });

  // 最終状態をサーバーから取得して表示
  const finalDoc = loadFromDB(docId)!;
  console.log("✅ Final TaskList:");
  console.dir(dump(finalDoc), { depth: null });
}

main();
