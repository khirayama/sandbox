import { useEffect, useState } from "react";

import { createState } from "../ot";

const state = {
  userA0: null,
  userA1: null,
  userB0: null,
};

state.userA0 = createState("userA");
state.userA1 = createState("userA");
state.userB0 = createState("userB");

function Task(props: { taskList: any; task: any; userId: string }) {
  const st = state[props.userId];

  const taskList = props.taskList;
  const task = props.task;
  const { moveTask, updateTask } = st;

  return (
    <li>
      <span>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => {
            updateTask(taskList.id, task.id, {
              completed: !task.completed,
            });
          }}
        />
      </span>
      <span
        style={{
          padding: "0.5rem",
          textDecoration: task.completed ? "line-through" : "none",
        }}
      >
        {task.text}
      </span>
      <button
        onClick={() => {
          moveTask(task.listId, task.id, 0);
        }}
      >
        Move to Top
      </button>
    </li>
  );
}

function TaskList(props: { taskList: any; userId: string }) {
  const st = state[props.userId];

  const taskList = props.taskList;
  const { insertTask, sortTasks, deleteCompletedTasks } = st;

  const [taskText, setTaskText] = useState("");

  return (
    <div>
      <h3>{taskList.name}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (taskText.trim() === "") {
            return;
          }
          insertTask(taskList.id, 0, taskText.trim());
          setTaskText("");
        }}
      >
        <input
          type="text"
          placeholder="Task Name"
          value={taskText}
          onChange={(e) => {
            setTaskText(e.target.value);
          }}
        />
        <button>Add Task</button>
      </form>
      <button onClick={() => sortTasks(taskList.id)}>Sort Tasks</button>
      <button onClick={() => deleteCompletedTasks(taskList.id)}>
        Delete Completed Tasks
      </button>
      <ul>
        {taskList.tasks.map((task) => {
          return (
            <Task
              key={task.id}
              taskList={taskList}
              task={task}
              userId={props.userId}
            />
          );
        })}
      </ul>
    </div>
  );
}

function App(props: { userId: string }) {
  const st = state[props.userId];

  const [s, setS] = useState(st.get());
  const { insertTaskList, sync } = st;

  const [taskListName, setTaskListName] = useState("");

  useEffect(() => {
    st.subscribe(() => {
      setS(st.get());
    });
    setInterval(() => {
      sync();
    }, 3000);
  }, []);

  return (
    <div style={{ flex: "1" }}>
      <h2>{props.userId}</h2>
      <details>
        <summary>State</summary>
        <pre>{JSON.stringify(s, null, 2)}</pre>
      </details>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (taskListName.trim() === "") {
              return;
            }
            insertTaskList(0, taskListName.trim());
            setTaskListName("");
          }}
        >
          <input
            type="text"
            placeholder="TaskList Name"
            id="taskListName"
            value={taskListName}
            onChange={(e) => {
              setTaskListName(e.target.value);
            }}
          />
          <button>Add TaskList</button>
        </form>
      </div>

      <div>
        {s.taskLists.map((taskList) => {
          return (
            <TaskList
              key={taskList.id}
              userId={props.userId}
              taskList={taskList}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function IndexPage() {
  return (
    <div style={{ display: "flex" }}>
      {Object.keys(state).map((userId) => {
        return <App key={userId} userId={userId} />;
      })}
    </div>
  );
}
