import * as assert from "assert";
import { v7 as uuid } from "uuid";
import { TaskList, Task, Operations, TaskListOperation } from "./ot.types";

function mergeOperations<T extends { id: string }>(a: T[], b: T[]): T[] {
  const merged = [...a, ...b];
  const uniqueOperations = new Map<string, T>();
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
  appOperations: {},
  taskListOperations: {},
};

const api = {
  sync: async (userId: string, operations: Operations): Promise<Operations> => {
    server.appOperations[userId] = mergeOperations(
      server.appOperations[userId] || [],
      operations.app
    );
    const taskListIds = Object.keys(operations.taskLists);
    for (const taskListId of taskListIds) {
      server.taskListOperations[taskListId] = mergeOperations(
        server.taskListOperations[taskListId] || [],
        operations.taskLists[taskListId] || []
      );
    }
    return {
      app: server.appOperations[userId] || [],
      taskLists: server.apps[userId].taskListIds.reduce(
        (
          acc: { [taskListId: string]: TaskListOperation[] },
          taskListId: string
        ) => {
          acc[taskListId] = server.taskListOperations[taskListId] || [];
          return acc;
        },
        {} as { [taskListId: string]: TaskListOperation[] }
      ),
    };
  },
};

export async function createState(userId: string) {
  const { taskLists } = await api.fetch(userId);

  const operations: Operations = {
    app: [],
    taskLists: {},
  };

  const state = {
    get: () => {
      const userApp = server.apps[userId];
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
    // mutations - app
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
    // mutations - tasklists
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
    // sync
    sync: async () => {
      const ops = await api.sync(userId, operations);

      operations.app = mergeOperations(operations.app, ops.app);
      const taskListIds = Object.keys(ops.taskLists);
      for (const taskListId of taskListIds) {
        operations.taskLists[taskListId] = mergeOperations(
          operations.taskLists[taskListId],
          ops.taskLists[taskListId] || []
        );
      }
    },
  };
  return state;
}

async function main() {
  userA0 = createState("userA");
  userA1 = createState("userA");
  userB0 = createState("userB");
}

main();
