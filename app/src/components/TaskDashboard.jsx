import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskDashboard.css';

function TaskDashboard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const apiKey = localStorage.getItem('user_id');
        const response = await axios.get('http://localhost:8000/engagements/tasks', {
          headers: { 'x-api-key': apiKey }
        });

        const data = response.data.tasks || [];
        setTasks(data);
        setFilteredTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = tasks.filter(task =>
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term)
    );
    setFilteredTasks(filtered);
  };

  return (
    <div className="dashboard">

      <div className="task-dashboard__search">
        <input
          type="text"
          className="task-dashboard__search-input"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="task-dashboard__table-wrapper">
        <table className="task-dashboard__table">
          <thead className="task-dashboard__table-head">
            <tr className="task-dashboard__table-row">
              <th className="task-dashboard__table-header">Title</th>
              <th className="task-dashboard__table-header">Description</th>
              <th className="task-dashboard__table-header">Due Date</th>
              <th className="task-dashboard__table-header">Contact ID</th>
            </tr>
          </thead>
          <tbody className="task-dashboard__table-body">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr className="task-dashboard__table-row" key={task._id}>
                  <td className="task-dashboard__table-cell">{task.title}</td>
                  <td className="task-dashboard__table-cell">{task.description}</td>
                  <td className="task-dashboard__table-cell">
                    {new Date(task.dueDate).toLocaleString()}
                  </td>
                  <td className="task-dashboard__table-cell">{task.contactId}</td>
                </tr>
              ))
            ) : (
              <tr className="task-dashboard__table-row">
                <td className="task-dashboard__table-cell" colSpan="4">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskDashboard;
