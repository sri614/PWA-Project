import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, ArrowLeft, Save } from 'lucide-react';
import './DealsDashboard.css';
import Engagements from './Engagements';

const DealsDashboard = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'edit'
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDeal, setEditDeal] = useState(null);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [engagements, setEngagements] = useState({
    NOTE: [],
    CALL: [],
    MEETING: []
  });
  const initialFormState = useRef(null);
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

  const apiKey = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('http://localhost:8000/deals', {
          headers: { 'x-api-key': apiKey }
        });
        const dealList = response.data.deals || [];
        setDeals(dealList);
        setFilteredDeals(dealList);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
      }
    };

    fetchDeals();
  }, [apiKey, viewMode]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = deals.filter(deal =>
        deal.properties?.dealname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.properties?.product_interest?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeals(filtered);
    } else {
      setFilteredDeals(deals);
    }
  }, [searchTerm, deals]);

  const handleRowClick = async (dealId) => {
    try {
      const [dealRes, engagementRes] = await Promise.all([
        axios.get(`http://localhost:8000/deals/${dealId}`, { headers: { 'x-api-key': apiKey } }),
        axios.get(`http://localhost:8000/deals/${dealId}/engagements`, { headers: { 'x-api-key': apiKey } })
      ]);

      const grouped = { NOTE: [], CALL: [], MEETING: [] };
      engagementRes.data.engagements?.forEach(e => {
        if (grouped[e.engagement?.type]) grouped[e.engagement?.type].push(e);
      });

      setEngagements(grouped);

      const deal = dealRes.data.deal;
      const p = deal.properties;
      const dealData = {
        id: deal.id,
        dealname: p.dealname || '',
        amount: p.amount || '',
        product_interest: p.product_interest || '',
        dealstage: p.dealstage || '',
        closedate: p.closedate ? new Date(p.closedate).toISOString().slice(0, 10) : '',
        pipeline: p.pipeline || '',
        hs_deal_stage_probability: p.hs_deal_stage_probability 
  ? parseFloat(p.hs_deal_stage_probability).toFixed(2) 
  : ''

      };

      console.log(dealData)

      setEditDeal(dealData);
      initialFormState.current = JSON.stringify(dealData);
      setHasChanges(false);
      setViewMode('edit');
    } catch (err) {
      console.error('Failed to fetch deal:', err);
    }
  };

  const handleEditChange = (e) => {
    const updatedDeal = { ...editDeal, [e.target.name]: e.target.value };
    setEditDeal(updatedDeal);
    setHasChanges(JSON.stringify(updatedDeal) !== initialFormState.current);
  };

  const handleUpdateDeal = async () => {
    try {
      const payload = {
        dealname: editDeal.dealname,
        amount: editDeal.amount,
        product_interest: editDeal.product_interest,
        dealstage: editDeal.dealstage,
        closedate: editDeal.closedate,
        pipeline: editDeal.pipeline,
        hs_deal_stage_probability: editDeal.hs_deal_stage_probability
      };

      await axios.patch(`http://localhost:8000/deals/${editDeal.id}`, payload, {
        headers: { 'x-api-key': apiKey }
      });

      initialFormState.current = JSON.stringify(editDeal);
      setHasChanges(false);
      alert('Deal updated successfully!');
    } catch (err) {
      setErrors({ api: 'Failed to update deal' });
    }
  };

  const renderListView = () => (
    <div className="dashboard">
      <div className="deals-dashboard__search">
        <input
          type="text"
          className="deals-dashboard__search-input"
          placeholder="Search by deal name or product interest..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dashboard__section-wrapper">
        <h3 className="dashboard__section-title">All Deals</h3>
        <div className="dashboard__table-scroll">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Deal Name</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Close Date</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody className="dashboard__table-body">
              {filteredDeals.length > 0 ? (
                filteredDeals.map(deal => {
                  const p = deal.properties || {};
                  return (
                    <tr
                      key={deal.id}
                      onClick={() => handleRowClick(deal.id)}
                      className="clickable-row"
                    >
                      <td className="deal-name-cell">{p.dealname}</td>
                      <td className="product-cell">{p.product_interest}</td>
                      <td className="amount-cell">{p.amount || '—'}</td>
                      <td className="date-cell">
                        {p.closedate ? new Date(p.closedate).toLocaleDateString() : '—'}
                      </td>
                      <td className={`stage-${p.dealstage?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {p.dealstage}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No deals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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

      <div className="deal-header">
        <div className="avatar-badge large">
          {editDeal?.dealname ? editDeal.dealname.charAt(0).toUpperCase() : ''}
        </div>
        <div className="deal-info">
          <h2>{editDeal?.dealname}</h2>
          <p className="deal-stage">{getDealStageLabel(editDeal?.dealstage)}</p>
        </div>
        <button 
          className={`save-button ${hasChanges ? 'active' : ''}`}
          onClick={handleUpdateDeal}
          disabled={!hasChanges}
        >
          <Save size={18} /> Save
        </button>
      </div>

      <Engagements leadId={editDeal?.id} type="deal" />
      
      <form onSubmit={e => { e.preventDefault(); handleUpdateDeal(); }}>
        <div className="form-grid">
          {[
            ['dealname', 'Deal Name', 'text', true],
            ['amount', 'Amount', 'number', false],
            ['pipeline', 'Pipeline', 'text', false],
            ['hs_deal_stage_probability', 'Probability', 'number', false],
          ].map(([field, label, type, required]) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <input
                type={type}
                name={field}
                value={editDeal?.[field] || ''}
                onChange={handleEditChange}
                required={required}
                placeholder={label}
                disabled
              />
            </div>
          ))}
        </div>

 <div className="form-group">
        <label>Pipeline</label>
        <input name="pipeline" type='text'  value="Manufacturing" disabled/>
      </div>

       <div className="form-group">
        <label>Close Date</label>
        <input name="closedate" type='date' onChange={handleEditChange} value={editDeal.closedate} />
      </div>

      <div className="form-group">
        <label>Product Interest</label>
        <select name="product_interest" onChange={handleEditChange} value={editDeal.product_interest}>
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
      value={editDeal.dealstage || ''}
      onChange={(e) => {
        const updated = { ...editDeal, dealstage: e.target.value };
        setEditDeal(updated);
        setDealHasChanges(JSON.stringify(updated) !== dealInitialState.current);
      }}
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
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    {item.createdAt && (
                      <div className="accordion__entry-meta">
                        <time dateTime={item.createdAt}>
                          {new Date(item.createdAt).toLocaleString()}
                        </time>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="accordion__empty-state">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
    case 'edit':
      return renderEditView();
    default:
      return renderListView();
  }
};

export default DealsDashboard;