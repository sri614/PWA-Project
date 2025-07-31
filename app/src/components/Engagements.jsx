// import React, { useState } from 'react';
// import './Engagements.css';
// import {
//   FileText,
//   Phone,
//   ClipboardCheck,
//   Calendar,
//   X
// } from 'lucide-react';
// import axios from 'axios';

// const Engagements = ({ leadId , type }) => {
//   const [activeTab, setActiveTab] = useState('');
//   const [showPopup, setShowPopup] = useState(false);

//   const [noteContent, setNoteContent] = useState('');
//   const [callContent, setCallContent] = useState('');
//   const [taskTitle, setTaskTitle] = useState('');
//   const [taskDescription, setTaskDescription] = useState('');
//   const [taskDueDate, setTaskDueDate] = useState('');
//   const [meetingTitle, setMeetingTitle] = useState('');
//   const [meetingBody, setMeetingBody] = useState('');
//   const [meetingTime, setMeetingTime] = useState('');

//   const apiKey = localStorage.getItem('user_id');

//   const openTab = (type) => {
//     setActiveTab(type);
//     setShowPopup(true);
//   };

//   const closePopup = () => {
//     setShowPopup(false);
//     setActiveTab('');
//   };

//   const handleSubmit = async () => {
//     const headers = {
//       'x-api-key': apiKey,
//       'Content-Type': 'application/json'
//     };

//      let payload = type === 'deal' ? { dealId: leadId } : { contactId: leadId };
//     let engagementType = '';

//     try {
//       switch (activeTab) {
//         case 'note':
//           engagementType = 'NOTE';
//           payload.engagementType = engagementType;
//           payload.title = 'Note from UI';
//           payload.body = noteContent;
//           break;

//         case 'call':
//           engagementType = 'CALL';
//           payload.engagementType = engagementType;
//           payload.title = 'Call Log';
//           payload.body = callContent;
//           break;

//         case 'task':
//           engagementType = 'TASK';
//           payload.engagementType = engagementType;
//           payload.title = taskTitle;
//           payload.description = taskDescription;
//           payload.dueDate = new Date(taskDueDate).toISOString();
//           break;

//         case 'meeting':
//           engagementType = 'MEETING';
//           payload.engagementType = engagementType;
//           payload.title = meetingTitle;
//           payload.body = meetingBody;
//           payload.startTime = new Date(meetingTime).toISOString();
//           break;

//         default:
//           return;
//       }

//       await axios.post('http://localhost:8000/engagements/create', payload, { headers });
//       alert(`${engagementType} saved successfully.`);
//       closePopup();
//     } catch (err) {
//       console.error(err);
//       alert('Failed to save engagement.');
//     }
//   };

//   return (
//     <div className="engagements">
//       {/* Icons */}
//       <div className="engagements__icons">
//         <div className="icon-box" onClick={() => openTab('note')}>
//           <FileText size={20} /><span>Note</span>
//         </div>
//         <div className="icon-box" onClick={() => openTab('call')}>
//           <Phone size={20} /><span>Call</span>
//         </div>
//         <div className="icon-box" onClick={() => openTab('task')}>
//           <ClipboardCheck size={20} /><span>Task</span>
//         </div>
//         <div className="icon-box" onClick={() => openTab('meeting')}>
//           <Calendar size={20} /><span>Meeting</span>
//         </div>
//       </div>

//       {/* Popup */}
//       {showPopup && (
//         <div className="engagement-modal">
//           <div className="engagement-modal__header">
//             <h3>
//               {activeTab === 'note' && 'Add Note'}
//               {activeTab === 'call' && 'Log Call'}
//               {activeTab === 'task' && 'Create Task'}
//               {activeTab === 'meeting' && 'Log Meeting'}
//             </h3>
//             <button className="close-btn" onClick={closePopup}><X size={18} /></button>
//           </div>

//           <div className="engagement-modal__content">
//             {activeTab === 'note' && (
//               <>
//                 <textarea
//                   placeholder="Start typing to leave a note..."
//                   value={noteContent}
//                   onChange={e => setNoteContent(e.target.value)}
//                 />
//                 <div className="engagement-modal__footer">
//                   <button onClick={handleSubmit} className="submit-btn">Save Note</button>
//                 </div>
//               </>
//             )}

//             {activeTab === 'call' && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Call Title"
//                   value={taskTitle}
//                   onChange={e => setTaskTitle(e.target.value)}
//                 />
//                 <textarea
//                   placeholder="Call Summary..."
//                   value={callContent}
//                   onChange={e => setCallContent(e.target.value)}
//                 />
//                 <div className="engagement-modal__footer">
//                   <button onClick={handleSubmit} className="submit-btn">Save Call</button>
//                 </div>
//               </>
//             )}

//             {activeTab === 'task' && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Task Title"
//                   value={taskTitle}
//                   onChange={e => setTaskTitle(e.target.value)}
//                 />
//                 <textarea
//                   placeholder="Task Description"
//                   value={taskDescription}
//                   onChange={e => setTaskDescription(e.target.value)}
//                 />
//                 <input
//                   type="datetime-local"
//                   value={taskDueDate}
//                   onChange={e => setTaskDueDate(e.target.value)}
//                 />
//                 <div className="engagement-modal__footer">
//                   <button onClick={handleSubmit} className="submit-btn">Save Task</button>
//                 </div>
//               </>
//             )}

//             {activeTab === 'meeting' && (
//               <>
//                 <input
//                   type="text"
//                   placeholder="Meeting Title"
//                   value={meetingTitle}
//                   onChange={e => setMeetingTitle(e.target.value)}
//                 />
//                 <textarea
//                   placeholder="Meeting Notes"
//                   value={meetingBody}
//                   onChange={e => setMeetingBody(e.target.value)}
//                 />
//                 <input
//                   type="datetime-local"
//                   value={meetingTime}
//                   onChange={e => setMeetingTime(e.target.value)}
//                 />
//                 <div className="engagement-modal__footer">
//                   <button onClick={handleSubmit} className="submit-btn">Save Meeting</button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Engagements;


import React, { useState } from 'react';
import './Engagements.css';
import {
  FileText,
  Phone,
  ClipboardCheck,
  Calendar,
  X
} from 'lucide-react';
import axios from 'axios';

const Engagements = ({ leadId, type }) => {
  const [activeTab, setActiveTab] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [callContent, setCallContent] = useState('');
  const [callTitle, setCallTitle] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingBody, setMeetingBody] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  const apiKey = localStorage.getItem('user_id');

  const openTab = (type) => {
    setActiveTab(type);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setActiveTab('');
    // Reset all input states
    setNoteContent('');
    setCallContent('');
    setCallTitle('');
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setMeetingTitle('');
    setMeetingBody('');
    setMeetingTime('');
  };

  const handleSubmit = async () => {
    if (!leadId || !apiKey) {
      alert('Missing user ID or lead/deal ID');
      return;
    }

    const headers = {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    };

    let payload = type === 'deal' ? { dealId: leadId } : { contactId: leadId };
    let engagementType = '';

    try {
      switch (activeTab) {
        case 'note':
          engagementType = 'NOTE';
          payload.engagementType = engagementType;
          payload.title = 'Note from UI';
          payload.body = noteContent;
          break;

        case 'call':
          engagementType = 'CALL';
          payload.engagementType = engagementType;
          payload.title = callTitle;
          payload.body = callContent;
          break;

        case 'task':
          engagementType = 'TASK';
          payload.engagementType = engagementType;
          payload.title = taskTitle;
          payload.description = taskDescription;
          payload.dueDate = new Date(taskDueDate).toISOString();
          break;

        case 'meeting':
          engagementType = 'MEETING';
          payload.engagementType = engagementType;
          payload.title = meetingTitle;
          payload.body = meetingBody;
          payload.startTime = new Date(meetingTime).toISOString();
          break;

        default:
          return;
      }

      console.log('Submitting engagement payload:', payload);

      await axios.post('http://localhost:8000/engagements/create', payload, { headers });
      alert(`${engagementType} saved successfully.`);
      closePopup();
    } catch (err) {
      console.error(err);
      alert('Failed to save engagement.');
    }
  };

  return (
    <div className="engagements">
      {/* Icons */}
      <div className="engagements__icons">
        <div className="icon-box" onClick={() => openTab('note')}>
          <FileText size={20} /><span>Note</span>
        </div>
        <div className="icon-box" onClick={() => openTab('call')}>
          <Phone size={20} /><span>Call</span>
        </div>
        <div className="icon-box" onClick={() => openTab('task')}>
          <ClipboardCheck size={20} /><span>Task</span>
        </div>
        <div className="icon-box" onClick={() => openTab('meeting')}>
          <Calendar size={20} /><span>Meeting</span>
        </div>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="engagement-modal">
          <div className="engagement-modal__header">
            <h3>
              {activeTab === 'note' && 'Add Note'}
              {activeTab === 'call' && 'Log Call'}
              {activeTab === 'task' && 'Create Task'}
              {activeTab === 'meeting' && 'Log Meeting'}
            </h3>
            <button className="close-btn" onClick={closePopup}><X size={18} /></button>
          </div>

          <div className="engagement-modal__content">
            {activeTab === 'note' && (
              <>
                <textarea
                  placeholder="Start typing to leave a note..."
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                />
                <div className="engagement-modal__footer">
                  <button onClick={handleSubmit} className="submit-btn">Save Note</button>
                </div>
              </>
            )}

            {activeTab === 'call' && (
              <>
                <input
                  type="text"
                  placeholder="Call Title"
                  value={callTitle}
                  onChange={e => setCallTitle(e.target.value)}
                />
                <textarea
                  placeholder="Call Summary..."
                  value={callContent}
                  onChange={e => setCallContent(e.target.value)}
                />
                <div className="engagement-modal__footer">
                  <button onClick={handleSubmit} className="submit-btn">Save Call</button>
                </div>
              </>
            )}

            {activeTab === 'task' && (
              <>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                />
                <textarea
                  placeholder="Task Description"
                  value={taskDescription}
                  onChange={e => setTaskDescription(e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                />
                <div className="engagement-modal__footer">
                  <button onClick={handleSubmit} className="submit-btn">Save Task</button>
                </div>
              </>
            )}

            {activeTab === 'meeting' && (
              <>
                <input
                  type="text"
                  placeholder="Meeting Title"
                  value={meetingTitle}
                  onChange={e => setMeetingTitle(e.target.value)}
                />
                <textarea
                  placeholder="Meeting Notes"
                  value={meetingBody}
                  onChange={e => setMeetingBody(e.target.value)}
                />
                <input
                  type="datetime-local"
                  value={meetingTime}
                  onChange={e => setMeetingTime(e.target.value)}
                />
                <div className="engagement-modal__footer">
                  <button onClick={handleSubmit} className="submit-btn">Save Meeting</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Engagements;
