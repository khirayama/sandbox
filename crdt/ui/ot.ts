// TODO: hash-sum https://www.npmjs.com/package/hash-sum を使ったcheckpointsの実装
// TODO: encode/decodeによるoperationsの圧縮
import { v7 as uuid } from "uuid";
import {
  App,
  TaskList,
  Task,
  TaskListWithTasks,
  Operations,
  TaskListOperation,
  AppOperation,
} from "./ot.types";

export function mergeOperations<T extends { id: string }>(a: T[], b: T[]): T[] {
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

export function applyAppOperations(
  initialApp: App,
  operations: AppOperation[]
): {
  app: App;
  taskListPool: {
    [taskListId: string]: { id: string; name: string; tasks: Task[] };
  };
} {
  const app: App = { ...initialApp };
  const taskListPool: {
    [taskListId: string]: {
      id: string;
      name: string;
      tasks: Task[];
    };
  } = {};

  for (const op of operations) {
    switch (op.type) {
      case "addTaskList": {
        const p = op.payload;
        const idx = Math.max(0, Math.min(p.index, app.taskListIds.length));
        app.taskListIds = [
          ...app.taskListIds.slice(0, idx),
          p.taskListId,
          ...app.taskListIds.slice(idx),
        ];
        break;
      }
      case "insertTaskList": {
        const p = op.payload;
        const idx = Math.max(0, Math.min(p.index, app.taskListIds.length));
        app.taskListIds = [
          ...app.taskListIds.slice(0, idx),
          p.taskList.id!,
          ...app.taskListIds.slice(idx),
        ];
        taskListPool[p.taskList.id] = {
          id: p.taskList.id,
          name: p.taskList.name || "",
          tasks: p.taskList.tasks || [],
        };
        break;
      }
      case "moveTaskList": {
        const p = op.payload;
        const fromIndex = app.taskListIds.indexOf(p.taskListId);
        const withoutItem = [
          ...app.taskListIds.slice(0, fromIndex),
          ...app.taskListIds.slice(fromIndex + 1),
        ];
        const toIndex = Math.max(0, Math.min(p.to, withoutItem.length));
        app.taskListIds = [
          ...withoutItem.slice(0, toIndex),
          p.taskListId,
          ...withoutItem.slice(toIndex),
        ];
        break;
      }
      case "deleteTaskList": {
        const p = op.payload;
        const idx = app.taskListIds.indexOf(p.taskListId);
        if (idx !== -1) {
          app.taskListIds = app.taskListIds.filter((id) => id !== p.taskListId);
        }
        break;
      }
    }
  }
  return {
    app,
    taskListPool,
  };
}

export function applyTaskListOperations(
  initialTaskLists: TaskListWithTasks[],
  operations: TaskListOperation[]
): { taskLists: TaskListWithTasks[] } {
  const taskLists: TaskListWithTasks[] = [
    ...initialTaskLists.map((tl) => ({ ...tl, tasks: [...tl.tasks] })),
  ];

  for (const op of operations) {
    switch (op.type) {
      case "updateTaskList": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          taskLists[tlIndex] = { ...taskLists[tlIndex], ...p.taskList };
        }
        break;
      }
      case "insertTask": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          const tl = taskLists[tlIndex];
          const i = Math.max(0, Math.min(p.index, tl.tasks.length));
          taskLists[tlIndex] = {
            ...tl,
            tasks: [...tl.tasks.slice(0, i), p.task, ...tl.tasks.slice(i)],
          };
        }
        break;
      }
      case "updateTask": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          const tl = taskLists[tlIndex];
          const taskIndex = tl.tasks.findIndex((t) => t.id === p.taskId);
          if (taskIndex !== -1) {
            taskLists[tlIndex] = {
              ...tl,
              tasks: tl.tasks.map((task, idx) =>
                idx === taskIndex ? { ...task, ...p.task } : task
              ),
            };
          }
        }
        break;
      }
      case "moveTask": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          const tl = taskLists[tlIndex];
          const taskIndex = tl.tasks.findIndex((t) => t.id === p.taskId);
          if (taskIndex !== -1) {
            const task = tl.tasks[taskIndex];
            const withoutTask = [
              ...tl.tasks.slice(0, taskIndex),
              ...tl.tasks.slice(taskIndex + 1),
            ];
            const toIndex = Math.max(0, Math.min(p.to, withoutTask.length));
            taskLists[tlIndex] = {
              ...tl,
              tasks: [
                ...withoutTask.slice(0, toIndex),
                task,
                ...withoutTask.slice(toIndex),
              ],
            };
          }
        }
        break;
      }
      case "sortTasks": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          const tl = taskLists[tlIndex];
          taskLists[tlIndex] = {
            ...tl,
            tasks: [...tl.tasks].sort((a, b) => {
              if (a.completed && !b.completed) {
                return 1;
              }
              if (!a.completed && b.completed) {
                return -1;
              }
              return 0;
            }),
          };
        }
        break;
      }
      case "deleteCompletedTasks": {
        const p = op.payload;
        const tlIndex = taskLists.findIndex((tl) => tl.id === p.taskListId);
        if (tlIndex !== -1) {
          const tl = taskLists[tlIndex];
          taskLists[tlIndex] = {
            ...tl,
            tasks: tl.tasks.filter((t) => !t.completed),
          };
        }
        break;
      }
    }
  }
  return {
    taskLists,
  };
}

const server: {
  apps: { [userId: string]: App };
  taskLists: { [taskListId: string]: TaskList };
  tasks: { [taskId: string]: Task };
  appOperations: { [userId: string]: AppOperation[] };
  taskListOperations: { [taskListId: string]: TaskListOperation[] };
} = {
  apps: {},
  taskLists: {},
  tasks: {},
  appOperations: {},
  taskListOperations: {},
};

const api = {
  sync: async (userId: string, operations: Operations): Promise<Operations> => {
    server.appOperations[userId] = mergeOperations(
      server.appOperations[userId] || [],
      operations.app
    );

    const { app } = applyAppOperations(
      server.apps[userId] || { taskListIds: [] },
      operations.app
    );

    for (const taskListId of app.taskListIds) {
      server.taskListOperations[taskListId] = mergeOperations(
        server.taskListOperations[taskListId] || [],
        operations.taskLists[taskListId] || []
      );
    }

    return {
      app: server.appOperations[userId] || [],
      taskLists: app.taskListIds.reduce(
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

export function createState(userId: string) {
  let listeners: Function[] = [];
  const commit = () => {
    for (const listener of listeners) {
      listener();
    }
  };
  const operations: Operations = {
    app: [],
    taskLists: {},
  };

  const state = {
    get: () => {
      const { app, taskListPool } = applyAppOperations(
        {
          taskListIds: [],
        },
        operations.app
      );

      let taskLists: TaskListWithTasks[] = app.taskListIds.map((id: string) => {
        return (
          taskListPool[id] || {
            id,
            name: "",
            tasks: [],
          }
        );
      });
      for (const taskListId of app.taskListIds) {
        const res = applyTaskListOperations(
          taskLists,
          operations.taskLists[taskListId] || []
        );
        taskLists = res.taskLists;
      }

      return {
        taskLists,
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
      commit();
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
      commit();
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
      commit();
    },
    deleteTaskList: (taskListId: string) => {
      operations.app.push({
        id: uuid(),
        type: "deleteTaskList",
        payload: {
          taskListId,
        },
      });
      commit();
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
      commit();
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
      commit();
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
      commit();
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
      commit();
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
      commit();
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
      commit();
    },
    // sync
    sync: async () => {
      const ops = await api.sync(userId, operations);

      operations.app = mergeOperations(operations.app, ops.app);
      const taskListIds = Object.keys(ops.taskLists);
      for (const taskListId of taskListIds) {
        operations.taskLists[taskListId] = mergeOperations(
          operations.taskLists[taskListId] || [],
          ops.taskLists[taskListId] || []
        );
      }
      commit();
    },
    subscribe: (listener: () => void) => {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };

  state.sync();
  return state;
}
