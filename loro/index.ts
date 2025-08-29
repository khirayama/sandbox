// tasklist-demo.tsx
import { LoroDoc, LoroMap } from "loro-crdt";

// 型定義
type Task = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
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
  root.set("tasks", tasks as any);
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
  const tasksData = tasks.toJSON() as Task[];
  
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
  const tasksData = tasks.toJSON() as Task[];
  
  const taskIndex = tasksData.findIndex((t) => t.id === taskId);
  const beforeIndex = beforeTaskId 
    ? tasksData.findIndex((t) => t.id === beforeTaskId)
    : tasksData.length;
    
  if (taskIndex !== -1) {
    const taskData = tasksData[taskIndex];
    tasks.delete(taskIndex, 1);
    const insertIndex = beforeIndex > taskIndex ? beforeIndex - 1 : beforeIndex;
    tasks.insert(insertIndex, taskData);
  }
}

function sortTasks(doc: LoroDoc) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as Task[];
  
  // ソート: 完了状態 -> 日付 -> 現在の順序
  const sortedTasks = [...tasksData].sort((a, b) => {
    // 1. 完了状態でソート（未完了が先）
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // 2. 日付でソート（古い順、日付がない場合は後）
    const dateA = a.date ? new Date(a.date).getTime() : Infinity;
    const dateB = b.date ? new Date(b.date).getTime() : Infinity;
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    
    // 3. 現在の順序を保持
    return tasksData.indexOf(a) - tasksData.indexOf(b);
  });
  
  // 全てのタスクを削除して、ソート済みで再挿入
  tasks.delete(0, tasksData.length);
  sortedTasks.forEach((task) => tasks.push(task));
}

function deleteCompletedTasks(doc: LoroDoc) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as Task[];
  
  // 未完了のタスクのみフィルタリング
  const incompleteTasks = tasksData.filter((task) => !task.completed);
  
  // 全てのタスクを削除して、未完了のもののみ再挿入
  tasks.delete(0, tasksData.length);
  incompleteTasks.forEach((task) => tasks.push(task));
}

function updateTaskText(doc: LoroDoc, taskId: string, newText: string) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as Task[];
  
  for (let i = 0; i < tasksData.length; i++) {
    if (tasksData[i].id === taskId) {
      // タスクを削除して新しいテキストで同じ位置に挿入
      tasks.delete(i, 1);
      tasks.insert(i, {
        id: taskId,
        text: newText,
        completed: tasksData[i].completed,
        date: tasksData[i].date
      });
      break;
    }
  }
}

function setTaskDate(doc: LoroDoc, taskId: string, date: string) {
  const tasks = doc.getMovableList("tasks");
  const tasksData = tasks.toJSON() as Task[];
  
  for (let i = 0; i < tasksData.length; i++) {
    if (tasksData[i].id === taskId) {
      // タスクを削除して新しい日付で同じ位置に挿入
      tasks.delete(i, 1);
      tasks.insert(i, {
        id: taskId,
        text: tasksData[i].text,
        completed: tasksData[i].completed,
        date: date
      });
      break;
    }
  }
}

function updateTaskListName(doc: LoroDoc, newName: string) {
  const root = doc.getMap("root");
  root.set("name", newName);
}

// 表示用
function dump(doc: LoroDoc): TaskList {
  const docData = doc.toJSON() as { root: TaskList, tasks: Task[] };
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
  console.log("📋 初期状態:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserA: タスク追加 & 名前変更（新機能: updateTaskListName使用）
  clientEdit(docId, (doc) => {
    addTask(doc, "t1", "Buy milk");
    addTask(doc, "t2", "Write report");
    updateTaskListName(doc, "UserA's TaskList");
  });
  console.log("📝 UserA: タスク追加 & リスト名変更後:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserB: タスク追加 & 日付設定（新機能: setTaskDate使用）
  clientEdit(docId, (doc) => {
    addTask(doc, "t3", "Clean desk");
    setTaskDate(doc, "t1", "2024-01-15");
    setTaskDate(doc, "t2", "2024-01-20");
    setTaskDate(doc, "t3", "2024-01-10");
  });
  console.log("🗓️ UserB: タスク追加 & 日付設定後:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserA: タスクテキスト変更 & 完了チェック（新機能: updateTaskText使用）
  clientEdit(docId, (doc) => {
    updateTaskText(doc, "t1", "Buy organic milk");
    toggleTask(doc, "t1", true);
    toggleTask(doc, "t3", true);
  });
  console.log("✏️ UserA: テキスト変更 & 完了チェック後:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserB: タスクソート（新機能: sortTasks使用）
  clientEdit(docId, (doc) => {
    sortTasks(doc);
  });
  console.log("🔄 UserB: タスクソート後（未完了→完了、日付順）:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserA: タスクの順序変更（新機能: moveTask使用）
  clientEdit(docId, (doc) => {
    // "Write report"タスク(t2)を末尾に移動
    moveTask(doc, "t2", null);
  });
  console.log("🔄 UserA: タスク順序変更後（Write reportを末尾に移動）:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // UserA: 完了済みタスク削除（新機能: deleteCompletedTasks使用）
  clientEdit(docId, (doc) => {
    deleteCompletedTasks(doc);
  });
  console.log("🗑️ UserA: 完了済みタスク削除後:");
  console.dir(dump(loadFromDB(docId)!), { depth: null });

  // 最終状態をサーバーから取得して表示
  const finalDoc = loadFromDB(docId)!;
  console.log("✅ 最終状態:");
  console.dir(dump(finalDoc), { depth: null });
}

main();
