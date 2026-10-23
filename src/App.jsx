import { useEffect } from "react";
import DownCounter from "./components/DownCounter/DownCounter.jsx";

// body[data-task] is used by styles/base.css for this task's page background.
const TASK_ID = "5";

export default function App() {
  useEffect(() => {
    document.body.dataset.task = TASK_ID;
    return () => { delete document.body.dataset.task; };
  }, []);

  return (
    <main className="page">
      <div className="page-head">
        <span className="task-chip">Task 5</span>
        <h1 className="page-title">Down Counter</h1>
        <p className="page-sub">Counts from 10 to 0. Start and Stop buttons enable and disable themselves based on the counter state.</p>
      </div>
      <DownCounter />
    </main>
  );
}
