import { v4 as uuid } from "uuid";

type App = {
  taskListIds: string[];
};

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

type TaskLists = {
  id: string;
  name: string;
  tasks: {
    id: string;
    text: string;
    completed: boolean;
  }[];
}[];

function createState() {
  const app: App = {
    taskListIds: [],
  };
  const taskLists: { [id: string]: TaskList } = {};
  const tasks: { [id: string]: Task } = {};

  const operations: {
    [taskListId: string]: (
      | {
          type: "sort";
          timestamp: number;
          taskIds: string[];
        }
      | {
          type: "move";
          timestamp: number;
          taskId: string;
          to: number;
        }
    )[];
  } = {};

  return {
    // getters
    get: (): TaskLists => {
      // console.log(app, taskLists, tasks);
      return app.taskListIds.map((id) => {
        const taskList = taskLists[id];
        return {
          id: taskList.id,
          name: taskList.name,
          tasks: taskList.taskIds.map((taskId) => {
            const task = tasks[taskId];
            return {
              id: task.id,
              text: task.text,
              completed: task.completed,
            };
          }),
        };
      });
    },
    // mutations - tasklists
    insertTaskList: (taskListId: string) => {
      app.taskListIds.push(taskListId);
      return taskLists[taskListId];
    },
    createTaskList: (name: string): TaskList => {
      const id = uuid();
      app.taskListIds.push(id);
      taskLists[id] = { id, name, taskIds: [] };
      return taskLists[id];
    },
    sortTasks: (taskListId: string) => {
      const fn = (a: Task, b: Task) => {
        if (a.completed && !b.completed) {
          return 1;
        }
        if (!a.completed && b.completed) {
          return -1;
        }
        return 0;
      };
      const taskList = taskLists[taskListId];
      taskList.taskIds.sort((ida, idb) => fn(tasks[ida], tasks[idb]));

      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
        type: "sort",
        timestamp: Date.now(),
        taskIds: taskList.taskIds.slice(),
      });
    },
    moveTask: (taskListId: string, taskId: string, to: number) => {
      const taskList = taskLists[taskListId];
      const from = taskList.taskIds.indexOf(taskId);
      if (from === -1) {
        throw new Error(
          `Task with id ${taskId} not found in task list ${taskListId}`
        );
      }
      if (to < 0 || to >= taskList.taskIds.length) {
        throw new Error(
          `Invalid target index ${to} for task list ${taskListId}`
        );
      }

      taskList.taskIds.splice(from, 1);
      taskList.taskIds.splice(to, 0, taskId);

      operations[taskListId] = operations[taskListId] || [];
      operations[taskListId].push({
        type: "move",
        timestamp: Date.now(),
        taskId,
        to,
      });
    },
    // mutations - tasks
    insertTask: (taskListId: string, text: string, idx: number = -1): Task => {
      const id = uuid();
      const task: Task = { id, text, completed: false };
      tasks[id] = task;
      if (idx === -1) {
        taskLists[taskListId].taskIds.push(id);
      } else {
        const taskList = taskLists[taskListId];
        taskList.taskIds.splice(idx, 0, id);
      }
      return task;
    },
    updateTask: (taskId: string, newTask: Partial<Task>) => {
      const task = tasks[taskId];
      tasks[taskId] = { ...task, ...newTask };
    },
    // mutations - sync
    sync: () => {},
  };
}

function main() {
  const stateA = createState();
  const tl = stateA.createTaskList("個人");

  const stateB = createState();
  stateB.insertTaskList(tl.id);

  stateA.insertTask(tl.id, "買い出し");
  stateA.insertTask(tl.id, "掃除");
  stateA.insertTask(tl.id, "洗濯");
  stateA.moveTask(tl.id, tl.taskIds[2], 0); // 洗濯, 買い出し, 掃除
  stateA.moveTask(tl.id, tl.taskIds[1], 2); // 洗濯, 掃除, 買い出し
  stateA.updateTask(tl.taskIds[0], { completed: true });
  stateA.sortTasks(tl.id); // 完了済みを後ろに移動, 掃除, 買い出し, 洗濯
  stateA.sync();

  console.log(
    JSON.stringify(stateA.get(), null, 2) === JSON.stringify(stateB.get())
  );
}

main();
