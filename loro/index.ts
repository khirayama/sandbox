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
  const snapshot = doc.export({ mode: 'snapshot' });
  fakeDB.set(docId, Buffer.from(snapshot));
  console.log(`📦 Saved snapshot for ${docId}, size=${snapshot.byteLength} bytes`);
}

// DB から読み込み
function loadFromDB(docId: string): LoroDoc | null {
  const buf = fakeDB.get(docId);
  if (!buf) return null;
  const doc = new LoroDoc();
  doc.import(buf);
  return doc;
}

// クライアントから受信して即マージ & 保存
function receiveFromClient(docId: string, clientDoc: LoroDoc) {
  if (!serverDoc) throw new Error("Server not initialized");
  const updates = clientDoc.export({ mode: 'update' });
  serverDoc.import(updates);
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
  const tasks = doc.getMovableList("tasks");
  const taskData = {
    id: taskId,
    text: text,
    completed: false
  };
  tasks.push(taskData);
}

function toggleTask(doc: LoroDoc, taskId: string, completed: boolean) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as any[];
  
  for (let i = 0; i < tasksData.length; i++) {
    if (tasksData[i].id === taskId) {
      // タスクを削除して新しいものを同じ位置に挿入
      tasks.delete(i, 1);
      tasks.insert(i, {
        id: taskId,
        text: tasksData[i].text,
        completed: completed
      });
      break;
    }
  }
}

function moveTask(doc: LoroDoc, taskId: string, beforeTaskId: string | null) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as any[];
  
  const taskIndex = tasksData.findIndex((t: any) => t.id === taskId);
  const beforeIndex = beforeTaskId 
    ? tasksData.findIndex((t: any) => t.id === beforeTaskId)
    : tasksData.length;
    
  if (taskIndex !== -1) {
    const taskData = tasksData[taskIndex];
    tasks.delete(taskIndex, 1);
    const insertIndex = beforeIndex > taskIndex ? beforeIndex - 1 : beforeIndex;
    tasks.insert(insertIndex, taskData);
  }
}

// 表示用
function dump(doc: LoroDoc): TaskList {
  const docData = doc.toJSON() as any;
  return {
    id: docData.root.id,
    name: docData.root.name,
    tasks: docData.tasks || [],
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
