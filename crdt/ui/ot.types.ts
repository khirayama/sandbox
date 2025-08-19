export type App = {
  taskListIds: string[];
};

export type TaskList = {
  id: string;
  name: string;
  taskIds: string[];
};

export type Task = {
  id: string;
  text: string;
  completed: boolean;
};

export type TaskListWithTasks = {
  id: string;
  name: string;
  tasks: Task[];
};

export type AppOperation =
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
        taskList: Partial<TaskListWithTasks> & { id: string };
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
    };

export type TaskListOperation =
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

export type Operations = {
  app: AppOperation[];
  taskLists: { [taskListId: string]: TaskListOperation[] };
};
