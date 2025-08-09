import assert from "assert";
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

type Operation =
  | {
      id: string;
      type: "addTaskList";
      payload: any;
    }
  | {
      id: string;
      type: "insertTaskList";
      payload: any;
    }
  | {
      id: string;
      type: "updateTaskList";
      payload: any;
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
        to: number;
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
      type: "deleteTask";
      payload: any;
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
  operations: {},
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
      operations: [],
    };
  },
  sync: async (taskListId: string, operations: Operation[]) => {
    server.operations[taskListId] = server.operations[taskListId] || [];
    server.operations[taskListId].push(...operations);
    return mergeOperations(server.operations[taskListId], operations);
  },
};

async function createState(userId: string) {
  const { taskLists } = await server.fetch(userId);
  taskLists.forEach((tl: TaskList) => server.startSession(tl.id));

  const operations: {
    [taskListId: string]: Operation[];
  } = {};

  return {
    debug: () => {
      return {
        operations,
      };
    },
    get: () => {
      return {
        taskLists: taskLists.map((tl) => {
          const taskList = { ...tl, tasks: [...tl.tasks] };
          for (const op of operations[tl.id] || []) {
            const p = op.payload;
            switch (op.type) {
              case "addTaskList":
                // Add task list logic
                break;
              case "insertTaskList":
                // Insert task list logic
                break;
              case "updateTaskList":
                // Update task list logic
                break;
              case "moveTaskList":
                // Move task list logic
                break;
              case "deleteTaskList":
                // Sort tasks logic
                break;
              case "insertTask":
                if (p.taskListId === taskList.id) {
                  const i = Math.max(
                    0,
                    Math.min(p.index, taskList.tasks.length)
                  );
                  taskList.tasks.splice(i, 0, p.task);
                }
                break;
              case "updateTask":
                if (p.taskListId === taskList.id) {
                  const task = taskList.tasks.find((t) => t.id === p.taskId);
                  if (task) {
                    Object.assign(task, p.task);
                  }
                }
                break;
              case "moveTask":
                if (p.taskListId === taskList.id) {
                  const task = taskList.tasks.find((t) => t.id === p.taskId);
                  if (task) {
                    const fromIndex = taskList.tasks.indexOf(task);
                    taskList.tasks.splice(fromIndex, 1);
                    const toIndex = Math.max(
                      0,
                      Math.min(p.to, taskList.tasks.length)
                    );
                    taskList.tasks.splice(toIndex, 0, task);
                  }
                }
                break;
              case "sortTasks":
                taskList.tasks.sort((a, b) => {
                  if (a.completed && !b.completed) {
                    return 1;
                  }
                  if (!a.completed && b.completed) {
                    return -1;
                  }
                  return 0;
                });
                break;
              case "deleteTask":
                // Delete tasks logic
                break;
            }
          }
          return taskList;
        }),
      };
    },
    // mutations - tasklists
    insertTaskList: (name: string, idx: number = -1) => {
      const id = uuid();
      if (idx === -1) {
        app.taskListIds.push(id);
      } else {
        app.taskListIds.splice(idx, 0, id);
      }
      taskLists[id] = { id, name, taskIds: [] };
      return taskLists[id];
    },
    addTaskList: (taskListId: string) => {
      app.taskListIds.push(taskListId);
      return taskLists[taskListId];
    },
    sortTasks: (taskListId: string) => {
      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
        id: uuid(),
        type: "sortTasks",
        payload: {
          taskListId,
        },
      });
    },
    moveTask: (taskListId: string, taskId: string, to: number) => {
      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
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
      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
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
      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
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
    sync: async (taskListId: string) => {
      const ops = await server.sync(taskListId, operations[taskListId]);
      operations[taskListId] = mergeOperations(operations[taskListId], ops);
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

  await stateA.sync(tl.id);
  await stateB.sync(tl.id);
  await stateA.sync(tl.id);
  tl = stateA.get().taskLists[1];

  stateA.moveTask(tl.id, tl.tasks[2].id, 0); // 炊事、買い出し、掃除、洗濯
  stateB.moveTask(tl.id, tl.tasks[1].id, 2); // 買い出し、炊事、掃除、洗濯

  stateA.updateTask(tl.id, tl.tasks[0].id, { completed: true });
  stateA.sortTasks(tl.id); // 完了済みを後ろに移動, 掃除, 買い出し, 洗濯
  // stateA.sync();
  await stateA.sync(tl.id);
  await stateB.sync(tl.id);
  await stateA.sync(tl.id);
  tl = stateA.get().taskLists[1];

  assert.deepEqual(stateA.get().taskLists[1], stateB.get().taskLists[0]);
  console.log(JSON.stringify(stateA.debug().operations, null, 2));
  console.log(stateB.get().taskLists[0]);
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
  // console.log(stateA.get().taskLists[1], stateA.debug().operations);
}

main();
