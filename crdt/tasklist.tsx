import * as assert from "assert";
import { v7 as uuid } from "uuid";

type TaskList = {
  id: string;
  name: string;
  taskIds: string[];
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type FetchedTaskList = {
  id: string;
  name: string;
  tasks: Task[];
};

type Operation =
  // App
  | {
      id: string;
      type: "addTaskList";
      payload: {
        index: number;
        taskListId: string;
      };
    }
  | {
      id: string;
      type: "insertTaskList";
      payload: {
        index: number;
        taskList: Partial<TaskList>;
      };
    }
  // TaskList
  | {
      id: string;
      type: "updateTaskList";
      payload: {
        taskListId: string;
        taskList: Partial<TaskList>;
      };
    }
  | {
      id: string;
      type: "moveTaskList";
      payload: {
        taskListId: string;
        to: number;
      };
    }
  | {
      id: string;
      type: "deleteTaskList";
      payload: {
        taskListId: string;
      };
    }
  | {
      id: string;
      type: "insertTask";
      payload: {
        taskListId: string;
        index: number;
        task: Task;
      };
    }
  | {
      id: string;
      type: "updateTask";
      payload: {
        taskListId: string;
        taskId: string;
        task: Partial<Task>;
      };
    }
  | {
      id: string;
      type: "moveTask";
      payload: {
        taskListId: string;
        taskId: string;
        to: number;
      };
    }
  | {
      id: string;
      type: "sortTasks";
      payload: {
        taskListId: string;
      };
    }
  | {
      id: string;
      type: "deleteCompletedTasks";
      payload: {
        taskListId: string;
      };
    };

function mergeOperations(a: Operation[], b: Operation[]): Operation[] {
  const merged = [...a, ...b];
  const uniqueOperations = new Map<string, Operation>();
  for (const op of merged) {
    if (!uniqueOperations.has(op.id)) {
      uniqueOperations.set(op.id, op);
    }
  }
  return Array.from(uniqueOperations.values()).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
}

const server = {
  apps: {},
  taskLists: {},
  tasks: {},
  sessions: {},
  operations: {
    apps: {},
    taskLists: {},
  },
};

const api = {
  fetch: async (userId: string) => {
    return {
      taskLists: server.apps[userId]?.taskListIds.map((tlid: string) => {
        const taskList = server.taskLists[tlid];
        return {
          id: taskList.id,
          name: taskList.name,
          tasks: taskList.taskIds.map((tid: string) => {
            const task = server.tasks[tid];
            return {
              id: task.id,
              text: task.text,
              completed: task.completed,
            };
          }),
        };
      }),
    };
  },
  startSession: async (taskListId: string) => {
    server.sessions[taskListId] = {
      snapshot: {
        taskList: server.taskLists[taskListId],
        tasks: server.taskLists[taskListId].taskIds.reduce(
          (acc, tid) => {
            acc[tid] = server.tasks[tid];
            return acc;
          },
          {} as { [taskId: string]: Task }
        ),
      },
      operations: {
        app: [],
        taskLists: {},
      },
    };
  },
  syncApp: async (userId: string, operations: Operation[]) => {
    server.operations.apps[userId] = server.operations.apps[userId] || [];
    server.operations.apps[userId].push(...operations);
    return mergeOperations(server.operations.apps[userId], operations);
  },
  syncTaskList: async (taskListId: string, operations: Operation[]) => {
    server.operations.taskLists[taskListId] =
      server.operations.taskLists[taskListId] || [];
    server.operations.taskLists[taskListId].push(...operations);
    return mergeOperations(server.operations.taskLists[taskListId], operations);
  },
};

async function createState(userId: string) {
  const { taskLists } = await api.fetch(userId);
  taskLists.forEach((tl: FetchedTaskList) => api.startSession(tl.id));

  const operations: {
    app: Operation[];
    taskLists: {
      [taskListId: string]: Operation[];
    };
  } = {
    app: [],
    taskLists: {},
  };

  return {
    debug: () => {
      return {
        operations,
      };
    },
    get: () => {
      const userApp = server.apps[userId];
      if (!userApp) {
        throw new Error(`User ${userId} not found`);
      }
      const app = {
        ...userApp,
        taskListIds: [...userApp.taskListIds],
      };
      const tls = [...taskLists.map((tl) => ({ ...tl, tasks: [...tl.tasks] }))];

      for (const op of operations.app) {
        switch (op.type) {
          case "addTaskList": {
            const p = op.payload;
            const idx = Math.max(0, Math.min(p.index, app.taskListIds.length));
            app.taskListIds.splice(idx, 0, p.taskListId);
            break;
          }
          case "insertTaskList": {
            const p = op.payload;
            const idx = Math.max(0, Math.min(p.index, app.taskListIds.length));
            app.taskListIds.splice(idx, 0, p.taskList.id!);
            tls.splice(idx, 0, { tasks: [], ...p.taskList });
            break;
          }
          case "moveTaskList": {
            const p = op.payload;
            const fromIndex = app.taskListIds.indexOf(p.taskListId);
            app.taskListIds.splice(fromIndex, 1);
            const toIndex = Math.max(0, Math.min(p.to, app.taskListIds.length));
            app.taskListIds.splice(toIndex, 0, p.taskListId);
            break;
          }
          case "deleteTaskList": {
            const p = op.payload;
            const idx = app.taskListIds.indexOf(p.taskListId);
            if (idx !== -1) {
              app.taskListIds.splice(idx, 1);
              tls.splice(idx, 1);
            }
            break;
          }
        }
      }

      tls.sort((a, b) => {
        return app.taskListIds.indexOf(a.id) - app.taskListIds.indexOf(b.id);
      });

      return {
        taskLists: tls.map((tl) => {
          for (const op of operations.taskLists[tl.id] || []) {
            switch (op.type) {
              case "updateTaskList": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  Object.assign(tl, p.taskList);
                }
                break;
              }
              case "insertTask": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  const i = Math.max(0, Math.min(p.index, tl.tasks.length));
                  tl.tasks.splice(i, 0, p.task);
                }
                break;
              }
              case "updateTask": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  const task = tl.tasks.find((t) => t.id === p.taskId);
                  if (task) {
                    Object.assign(task, p.task);
                  }
                }
                break;
              }
              case "moveTask": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  const task = tl.tasks.find((t) => t.id === p.taskId);
                  if (task) {
                    const fromIndex = tl.tasks.indexOf(task);
                    tl.tasks.splice(fromIndex, 1);
                    const toIndex = Math.max(
                      0,
                      Math.min(p.to, tl.tasks.length)
                    );
                    tl.tasks.splice(toIndex, 0, task);
                  }
                }
                break;
              }
              case "sortTasks": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  tl.tasks.sort((a, b) => {
                    if (a.completed && !b.completed) {
                      return 1;
                    }
                    if (!a.completed && b.completed) {
                      return -1;
                    }
                    return 0;
                  });
                }
                break;
              }
              case "deleteCompletedTasks": {
                const p = op.payload;
                if (p.taskListId === tl.id) {
                  tl.tasks = tl.tasks.filter((t) => !t.completed);
                }
                break;
              }
            }
          }
          return tl;
        }),
      };
    },
    // mutations - tasklists
    insertTaskList: (index: number, name: string) => {
      operations.app.push({
        id: uuid(),
        type: "insertTaskList",
        payload: {
          index,
          taskList: {
            id: uuid(),
            name,
          },
        },
      });
    },
    addTaskList: (taskListId: string) => {
      operations.app.push({
        id: uuid(),
        type: "addTaskList",
        payload: {
          index: operations.app.length,
          taskListId,
        },
      });
    },
    updateTaskList: (taskListId: string, newTaskList: Partial<TaskList>) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "updateTaskList",
        payload: {
          taskListId,
          taskList: newTaskList,
        },
      });
    },
    moveTaskList: (taskListId: string, to: number) => {
      operations.app.push({
        id: uuid(),
        type: "moveTaskList",
        payload: {
          taskListId,
          to,
        },
      });
    },
    deleteTaskList: (taskListId: string) => {
      operations.app.push({
        id: uuid(),
        type: "deleteTaskList",
        payload: {
          taskListId,
        },
      });
    },
    sortTasks: (taskListId: string) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "sortTasks",
        payload: {
          taskListId,
        },
      });
    },
    deleteCompletedTasks: (taskListId: string) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "deleteCompletedTasks",
        payload: {
          taskListId,
        },
      });
    },
    moveTask: (taskListId: string, taskId: string, to: number) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "moveTask",
        payload: {
          taskListId,
          taskId,
          to,
        },
      });
    },
    // mutations - tasks
    insertTask: (taskListId: string, index: number, text: string) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "insertTask",
        payload: {
          taskListId,
          index,
          task: {
            id: uuid(),
            text,
            completed: false,
          },
        },
      });
    },
    updateTask: (
      taskListId: string,
      taskId: string,
      newTask: Partial<Task>
    ) => {
      operations.taskLists[taskListId] = operations.taskLists[taskListId] || [];
      operations.taskLists[taskListId].push({
        id: uuid(),
        type: "updateTask",
        payload: {
          taskListId,
          taskId,
          task: newTask,
        },
      });
    },
    // mutations - sync
    syncApp: async () => {
      const ops = await api.syncApp(userId, operations.app);
      operations.app = mergeOperations(operations.app, ops);
    },
    syncTaskList: async (taskListId: string) => {
      const ops = await api.syncTaskList(
        taskListId,
        operations.taskLists[taskListId]
      );
      operations.taskLists[taskListId] = mergeOperations(
        operations.taskLists[taskListId],
        ops
      );
    },
  };
}

function seed() {
  const taskList0: TaskList = {
    id: uuid(),
    name: "個人",
    taskIds: [],
  };
  const taskList1: TaskList = {
    id: uuid(),
    name: "家族",
    taskIds: [],
  };

  const task0: Task = {
    id: uuid(),
    text: "買い出し",
    completed: false,
  };
  const task1: Task = {
    id: uuid(),
    text: "掃除",
    completed: false,
  };

  taskList1.taskIds.push(task0.id, task1.id);

  const uidA = uuid();
  const appA = {
    taskListIds: [taskList0.id, taskList1.id],
  };

  const uidB = uuid();
  const appB = {
    taskListIds: [taskList1.id],
  };

  server.apps[uidA] = appA;
  server.apps[uidB] = appB;
  server.taskLists[taskList0.id] = taskList0;
  server.taskLists[taskList1.id] = taskList1;
  server.tasks[task0.id] = task0;
  server.tasks[task1.id] = task1;

  return [uidA, uidB];
}

async function main() {
  const [uidA, uidB] = seed();

  const stateA = await createState(uidA);
  const stateB = await createState(uidB);

  let tl = stateA.get().taskLists[1];
  stateA.insertTask(tl.id, tl.tasks.length, "洗濯");
  stateB.insertTask(tl.id, tl.tasks.length, "炊事");
  // 買い出し、掃除、炊事、洗濯

  await stateA.syncTaskList(tl.id);
  await stateB.syncTaskList(tl.id);
  await stateA.syncTaskList(tl.id);
  tl = stateA.get().taskLists[1];

  stateA.moveTask(tl.id, tl.tasks[2].id, 0); // 炊事、買い出し、掃除、洗濯
  stateB.moveTask(tl.id, tl.tasks[1].id, 2); // 買い出し、炊事、掃除、洗濯

  stateA.updateTask(tl.id, tl.tasks[0].id, { completed: true });
  stateA.sortTasks(tl.id); // 完了済みを後ろに移動, 掃除, 買い出し, 洗濯
  stateB.insertTaskList(0, "仕事"); // 仕事のタスクリストを先頭に追加
  stateB.deleteTaskList(stateB.get().taskLists[0].id);
  stateB.deleteCompletedTasks(tl.id);
  stateA.moveTaskList(tl.id, 0);
  await stateA.syncApp();
  await stateB.syncApp();
  await stateA.syncTaskList(tl.id);
  await stateB.syncTaskList(tl.id);
  await stateA.syncTaskList(tl.id);
  tl = stateA.get().taskLists[1];

  assert.deepEqual(stateA.get().taskLists[0], stateB.get().taskLists[0]);
  console.log(stateB.get().taskLists[0]);
  // console.log(stateB.get());
  // console.log(JSON.stringify(stateA.debug().operations, null, 2));
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
}

main();
