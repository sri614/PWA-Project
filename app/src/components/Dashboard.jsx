import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';
import Engagements from './Engagements';



const Dashboard = () => {
  const initialFormState = useRef(null);

  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [newL, setNewL] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    product_interest: '',
    industry: '',
    hs_lead_status: 'NEW'
  });
  const [errors, setErrors] = useState({});
  const [newUserCount, setNewUserCount] = useState(0);
  const [openUserCount, setOpenUserCount] = useState(0);
  const [newLeads, setNewLeads] = useState([]);
  const [openLeads, setOpenLeads] = useState([]);
  const [editLead, setEditLead] = useState(null);
  const [engagements, setEngagements] = useState({
    NOTE: [],
    CALL: [],
    MEETING: []
  });
  const [hasChanges, setHasChanges] = useState(false);
const [editDealInline, setEditDealInline] = useState(null);
const [dealHasChanges, setDealHasChanges] = useState(false);
const dealInitialState = useRef(null);


let dealStageOptions=[
    {
      "label": "Qualified",
      "value": "1094908196"
    },
    {
      "label": "Product reviewed",
      "value": "1096871688"
    },
    {
      "label": "Proposal Sent",
      "value": "1094908198"
    },
    {
      "label": "Negotiation",
      "value": "1094908197"
    },
    {
      "label": "Closed Won",
      "value": "1094908201"
    },
    {
      "label": "Closed Lost",
      "value": "1094908202"
    }
  ]

  const getDealStageLabel = (value) => {
  const match = dealStageOptions.find(option => option.value === value);
  return match ? match.label : value;
};

const handleUpdateDeal = async () => {
  try {
    const apiKey = localStorage.getItem('user_id');
    await axios.patch(`http://localhost:8000/deals/${editDealInline.id}`, editDealInline, {
      headers: { 'x-api-key': apiKey }
    });
    alert('Deal updated successfully!');
    dealInitialState.current = JSON.stringify(editDealInline);
    console.log("deals",editDealInline)
    setDealHasChanges(false);
  } catch (err) {
    alert('Failed to update deal');
  }
};



  const AvatarIcon = ({ size = 'normal' }) => (
    <span className={`material-icons-outlined avatar-icon ${size === 'large' ? 'large' : ''}`}>
      person
    </span>
  );

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const apiKey = localStorage.getItem('user_id');
        const response = await axios.get('http://localhost:8000/leads', {
          headers: { 'x-api-key': apiKey }
        });

        const leads = response.data.leads || [];
        const newList = leads.filter(lead => lead.properties.hs_lead_status?.toUpperCase() === 'NEW');
        const openList = leads.filter(lead => lead.properties.hs_lead_status?.toUpperCase() !== 'NEW');

        setNewLeads(newList);
        setOpenLeads(openList);
        setNewUserCount(newList.length);
        setOpenUserCount(openList.length);
      } catch (error) {
        console.error('Failed to load leads:', error);
      }
    };

    if (viewMode === 'list') {
      fetchLeads();
    }
  }, [viewMode]);

  const handleInputChange = (e) => {
    setNewL({ ...newL, [e.target.name]: e.target.value });
  };

  const handleAddLead = async () => {
    const requiredFields = ['name', 'email', 'phone', 'company'];
    const formErrors = {};

    requiredFields.forEach(field => {
      if (!newL[field]?.trim()) {
        formErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (newL.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newL.email)) {
      formErrors.email = 'Enter a valid email address';
    }

    if (newL.phone && !/^\d{7,15}$/.test(newL.phone.replace(/\D/g, ''))) {
      formErrors.phone = 'Enter a valid phone number';
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const apiKey = localStorage.getItem('user_id');
      const payload = {
        email: newL.email,
        phone: newL.phone,
        hs_lead_status: newL.hs_lead_status || 'NEW',
        sales_representative: apiKey,
        firstname: newL.name,
        product_interest: newL.product_interest,
        company: newL.company,
        jobtitle: newL.jobTitle,
        industry: newL.industry
      };

      await axios.post('http://localhost:8000/leads', payload, {
        headers: { 'x-api-key': apiKey }
      });

      alert("Contact created successfully");
      setViewMode('list');
      setNewL({
        name: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        product_interest: '',
        industry: '',
        hs_lead_status: 'NEW'
      });
    } catch (error) {
      setErrors({ api: error.response?.data?.message || 'Failed to create lead' });
    }
  };

  
const fetchDealEngagements = async (dealId) => {
  try {
    const apiKey = localStorage.getItem('user_id');
    const response = await axios.get(`http://localhost:8000/deals/${dealId}/engagements`, {
      headers: { 'x-api-key': apiKey }
    });

    const grouped = { NOTE: [], CALL: [], MEETING: [] };
    response.data.engagements?.forEach(e => {
      if (grouped[e.engagement?.type]) grouped[e.engagement?.type].push(e);
    });
    setEngagements(grouped);
  } catch (err) {
    console.error('Failed to load deal engagements', err);
  }
};


  const handleRowClick = async (leadId) => {
    try {
      const apiKey = localStorage.getItem('user_id');
      const [leadRes, engagementRes] = await Promise.all([
        axios.get(`http://localhost:8000/leads/${leadId}`, { headers: { 'x-api-key': apiKey } }),
        axios.get(`http://localhost:8000/leads/${leadId}/engagements`, { headers: { 'x-api-key': apiKey } })
      ]);

      const grouped = { NOTE: [], CALL: [], MEETING: [] };
      engagementRes.data.engagements?.forEach(e => {
        if (grouped[e.engagement?.type]) grouped[e.engagement?.type].push(e);
      });

      setEngagements(grouped);

      const { contact, deals = [] } = leadRes.data;
      const p = contact.properties;
      const leadData = {
        id: contact.id,
        firstname: p.firstname || '',
        email: p.email || '',
        phone: p.phone || '',
        company: p.company || '',
        jobtitle: p.jobtitle || '',
        industry: p.industry || '',
        product_interest: p.product_interest ,
        hs_lead_status: p.hs_lead_status || 'NEW',
        deals: deals
      };

      setEditLead(leadData);
      initialFormState.current = JSON.stringify(leadData);
      setHasChanges(false);
      setViewMode('edit');
    } catch (err) {
      console.error('Failed to fetch lead:', err);
    }
  };

  const handleEditChange = (e) => {
    const updatedLead = { ...editLead, [e.target.name]: e.target.value };
    setEditLead(updatedLead);
    setHasChanges(JSON.stringify(updatedLead) !== initialFormState.current);
  };

  const handleUpdateLead = async () => {
    try {
      const apiKey = localStorage.getItem('user_id');
      const payload = {
        firstname: editLead.firstname,
        email: editLead.email,
        phone: editLead.phone,
        company: editLead.company,
        jobtitle: editLead.jobtitle,
        industry: editLead.industry,
        product_interest: editLead.product_interest ,
        hs_lead_status: editLead.hs_lead_status
      };

      await axios.patch(`http://localhost:8000/leads/${editLead.id}`, payload, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });


      initialFormState.current = JSON.stringify(editLead);
      setHasChanges(false);
      alert('Lead updated successfully!');
    } catch (err) {
      setErrors({ api: 'Failed to update lead' });
    }
  };

  const handleInlineDealChange = (e) => {
  const updated = { ...editDealInline, [e.target.name]: e.target.value };
  setEditDealInline(updated);
  setDealHasChanges(JSON.stringify(updated) !== dealInitialState.current);
};


  const renderListView = () => (
    <div className="dashboard">
      <section className="dashboard__quick-actions">
        <h4>Lead pipeline</h4>
        <div className="metrics">
          <div>
            <strong>{newUserCount}</strong>
            <p>New</p>
          </div>
          <div>
            <strong>{openUserCount}</strong>
            <p>Open</p>
          </div>
        </div>
      </section>

      {['New Leads', newLeads, 'Open Leads', openLeads].map((item, idx) => {
        if (typeof item === 'string') return null;
        const title = idx === 1 ? 'New Leads' : 'Open Leads';

        return (
          <div className="dashboard__section-wrapper" key={title}>
            <h3 className="dashboard__section-title">{title}</h3>
            <div className="dashboard__table-scroll">
              <table className="dashboard__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Phone</th>
                    
                  </tr>
                </thead>
<tbody className="dashboard__table-body">
  {item.map(lead => {
    const props = lead.properties;
    return (
      <tr key={lead.id} onClick={() => handleRowClick(lead.id)} className="clickable-row">
        <td>
          <div className="lead-name-cell">
            <AvatarIcon />
            <span className="lead-name-text">{props.firstname}</span>
          </div>
        </td>
        <td className={`status-${props.hs_lead_status?.toLowerCase()}`}>
          {props.hs_lead_status}
        </td>
        <td className="email-cell">{props.email}</td>
        <td className="company-cell">{props.company}</td>
        <td className="phone-cell">{props.phone}</td>
      </tr>
    );
  })}
</tbody>

              </table>
            </div>
          </div>
        );
      })}

      <button
        className="dashboard__create-btn"
        onClick={() => setViewMode('create')}
      >
        <Plus size={18} /> Create
      </button>
    </div>
  );

  const renderCreateView = () => (
    <div className="dashboard-form">
      <button
        className="back-button"
        onClick={() => setViewMode('list')}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h2>Create New Lead</h2>

      {errors.api && <p className="error">{errors.api}</p>}
      <form onSubmit={e => { e.preventDefault(); handleAddLead(); }}>
        <div className="form-grid">
          {[
            ['name', 'Name', 'text', true],
            ['company', 'Company', 'text', true],
            ['email', 'Email', 'email', true],
            ['phone', 'Phone', 'tel', true],
            ['industry', 'Industry', 'text', false],
            ['jobTitle', 'Job Title', 'text', false]
          ].map(([key, label, type, required]) => (
            <div className="form-group" key={key}>
              <label>{label}</label>
              <input
                type={type}
                name={key}
                value={newL[key]}
                onChange={handleInputChange}
                required={required}
                placeholder={label}
                disabled
              />
              {errors[key] && <p className="error">{errors[key]}</p>}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Lead Status</label>
          <select name="hs_lead_status" onChange={handleInputChange} value={newL.hs_lead_status}>
            <option value="NEW">New</option>
            <option value="CONNECTED">Discovery</option>
            <option value="OPEN_DEAL">Open Deal</option>
            <option value="IN_PROGRESS">Quotation</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="UNQUALIFIED">Unqualified</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>

        <div className="form-group">
          <label>Product Interest</label>
          <select name="product_interest" onChange={handleInputChange} value={newL.product_interest}>
            <option value="">Select Product Interest</option>
            <option value="Geared Motor">Geared Motor</option>
            <option value="Drum Motor">Drum Motor</option>
            <option value="Induction Motor">Induction Motor</option>
            <option value="Vibrator Motor">Vibrator Motor</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">
          Add Lead
        </button>
      </form>
    </div>
  );



  const renderEditView = () => (
    <div className="dashboard-form">
      <div className="edit-header">
        <button
          className="back-button"
          onClick={() => setViewMode('list')}
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>



      <div className="lead-header">
        <div className="avatar-badge large">
          {editLead?.firstname ? editLead.firstname.charAt(0).toUpperCase() : ''}
        </div>
        <div className="lead-info">
          <h2>{editLead?.firstname}</h2>
          <p className="lead-email">{editLead?.email}</p>engagements
        </div>
        <button
          className={`save-button ${hasChanges ? 'active' : ''}`}
          onClick={handleUpdateLead}
          disabled={!hasChanges}
        >
          <Save size={18} /> Save
        </button>
      </div>

      <Engagements leadId={editLead?.id} type="contact" />

      <form onSubmit={e => { e.preventDefault(); handleUpdateLead(); }}>
        <div className="form-grid">
          {[
            ['firstname', 'Name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone', 'tel'],
            ['company', 'Company', 'text'],
            ['jobtitle', 'Job Title', 'text'],
            ['industry', 'Industry', 'text']
          ].map(([field, label, type]) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <input
                type={type}
                name={field}
                value={editLead?.[field] || ''}
                onChange={handleEditChange}
                placeholder={label}
                disabled
              />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Product Interest</label>
          <select
            name="product_interest"
            value={editLead.product_interest}
            onChange={handleEditChange}
          >
            <option value="">Select Product</option>
            <option value="Geared Motor">Geared Motor</option>
            <option value="Drum Motor">Drum Motor</option>
            <option value="Induction Motor">Induction Motor</option>
            <option value="Vibrator Motor">Vibrator Motor</option>
          </select>
        </div>

        <div className="form-group">
          <label>Lead Status</label>
          <select
            name="hs_lead_status"
            value={editLead?.hs_lead_status || 'NEW'}
            onChange={handleEditChange}
          >
            <option value="NEW">New</option>
            <option value="CONNECTED">Discovery</option>
            <option value="OPEN_DEAL">Open Deal</option>
            <option value="IN_PROGRESS">Quotation</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Won">Closed Won</option>
            <option value="UNQUALIFIED">Unqualified</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>
        </div>

        {errors.api && <p className="error">{errors.api}</p>}
      </form>

      <div className="accordion">
        <details className="accordion__item" open={editLead?.deals?.length > 0}>
          <summary className="accordion__summary">
            <span className="accordion__title">Associated Deals</span>
            <span className="accordion__count">
              {editLead?.deals?.length || 0}
              <span className="accordion__arrow-icon">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </summary>
          <div className="accordion__content">
            {editLead?.deals?.length > 0 ? (
              editLead.deals.map((deal, idx) => (
                
                <div
                  className="accordion__entry"
                  key={deal.id || idx}
onClick={() => {
  setViewMode('deal-edit');
  const props = deal.properties;
  const dealData = {
    id: deal.id,
    dealname: props.dealname || '',
    amount: props.amount || '',
    product_interest: props.product_interest || '',
    dealstage: props.dealstage || '',
    closedate: props.closedate ? new Date(props.closedate).toISOString().slice(0, 10) : '',
    pipeline: props.pipeline || '',
    hs_deal_stage_probability: props.hs_deal_stage_probability ? parseFloat(props.hs_deal_stage_probability).toFixed(2) : ''
  };
  setEditDealInline(dealData);
  dealInitialState.current = JSON.stringify(dealData);
  setDealHasChanges(false);

  // ✅ Fetch deal engagements
  fetchDealEngagements(deal.id);
}}

>
                  <h4 className="accordion__entry-title">{deal.properties.dealname}</h4>
                  <div className="accordion__entry-details">
                    <div className="detail-row">
                      <span className="detail-label">Amount:</span>
                      <span className="detail-value">{deal.properties.amount || '—'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Stage:</span>
                      <span className="detail-value">{getDealStageLabel(deal.properties.dealstage)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Product:</span>
                      <span className="detail-value">{deal.properties.product_interest}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Close Date:</span>
                      <span className="detail-value">
                        {deal.properties.closedate ? new Date(deal.properties.closedate).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="accordion__empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16H12.01" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>No associated deals found</p>
              </div>
            )}
          </div>
        </details>

        {['NOTE', 'CALL', 'MEETING'].map((type) => (
          <details key={type} className="accordion__item" open={engagements[type]?.length > 0}>
            <summary className="accordion__summary">
              <span className="accordion__title">{type}</span>
              <span className="accordion__count">
                {engagements[type]?.length || 0}
                <span className="accordion__arrow-icon">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </summary>
            <div className="accordion__content">
              {engagements[type]?.length > 0 ? (
                engagements[type].map((item, idx) => (
                  <div className="accordion__entry" key={idx}>
                    <h4 className="accordion__entry-title">{item.metadata?.title || `Untitled ${type.toLowerCase()}`}</h4>
                    <p className="accordion__entry-description">{item.metadata?.body || item.description || 'No description provided'}</p>

                    <div className="accordion__entry-meta">
                        <time dateTime={item.engagement.createdAt}>
                          {new Date(item.engagement.createdAt).toLocaleString()}
                        </time>
                      </div>
  
                  </div>
                ))
              ) : (
                <div className="accordion__empty-state">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 8V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 16H12.01" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>No {type.toLowerCase()} engagements found</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );

const renderEditDealInline = () => (
  <div className="dashboard-form">
    <div className="edit-header">
      <button
        className="back-button"
        onClick={() => setViewMode('edit')}
      >
        <ArrowLeft size={18} /> Back
      </button>
    </div>

    <div className="deal-header">
      <div className="avatar-badge large">
        {editDealInline?.dealname ? editDealInline.dealname.charAt(0).toUpperCase() : ''}
      </div>
      <div className="deal-info">
        <h2>{editDealInline?.dealname}</h2>
        <p className="deal-stage">{getDealStageLabel(editDealInline?.dealstage)}</p>
      </div>
      <button
        className={`save-button ${dealHasChanges ? 'active' : ''}`}
        onClick={handleUpdateDeal}
        disabled={!dealHasChanges}
      >
        <Save size={18} /> Save
      </button>
    </div>

    <Engagements leadId={editDealInline?.id} type="deal" />


    <form onSubmit={e => { e.preventDefault(); handleUpdateDeal(); }}>
      <div className="form-grid">
        {[
          ['dealname', 'Deal Name', 'text', true],
          ['amount', 'Amount', 'number', false],
          ['hs_deal_stage_probability', 'Probability', 'number', false]
        ].map(([field, label, type, required]) => (
          <div className="form-group" key={field}>
            <label>{label}</label>
            <input
              type={type}
              name={field}
              value={editDealInline?.[field] || ''}
              onChange={handleInlineDealChange}
              required={required}
              placeholder={label}
            />
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Pipeline</label>
        <input name="pipeline" type="text" value="Manufacturing" disabled />
      </div>

      <div className="form-group">
        <label>Close Date</label>
        <input
          name="closedate"
          type="date"
          onChange={handleInlineDealChange}
          value={editDealInline.closedate}
        />
      </div>

      <div className="form-group">
        <label>Product Interest</label>
        <select
          name="product_interest"
          onChange={handleInlineDealChange}
          value={editDealInline.product_interest}
        >
          <option value="">Select Product Interest</option>
          <option value="Geared Motor">Geared Motor</option>
          <option value="Drum Motor">Drum Motor</option>
          <option value="Induction Motor">Induction Motor</option>
          <option value="Vibrator Motor">Vibrator Motor</option>
        </select>
      </div>

      <div className="form-group">
        <label>Deal Stage</label>
        <select
          name="dealstage"
          value={editDealInline.dealstage || ''}
          onChange={handleInlineDealChange}
        >
          <option value="">Select Stage</option>
          {dealStageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {errors.api && <p className="error">{errors.api}</p>}
    </form>

    <div className="accordion">
      {['NOTE', 'CALL', 'MEETING'].map((type) => (
        <details key={type} className="accordion__item" open={engagements[type]?.length > 0}>
          <summary className="accordion__summary">
            <span className="accordion__title">{type}</span>
            <span className="accordion__count">
              {engagements[type]?.length || 0}
              <span className="accordion__arrow-icon">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </summary>
          <div className="accordion__content">
            {engagements[type]?.length > 0 ? (
              engagements[type].map((item, idx) => (
                <div className="accordion__entry" key={idx}>
                  <h4 className="accordion__entry-title">{item.metadata?.title || `Untitled ${type.toLowerCase()}`}</h4>
                  <p className="accordion__entry-description">{item.metadata?.body || item.description || 'No description provided'}</p>
                  {item.engagement.createdAt && (
                    <div className="accordion__entry-meta">
                      <time dateTime={item.engagement.createdAt}>
                        {new Date(item.engagement.createdAt).toLocaleString()}
                      </time>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="accordion__empty-state">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16H12.01" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>No {type.toLowerCase()} engagements found</p>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  </div>
);




  switch (viewMode) {
    case 'create':
      return renderCreateView();
    case 'edit':
      return renderEditView();
    case 'deal-edit':
      return renderEditDealInline();
    default:
      return renderListView();
  }
};

export default Dashboard;