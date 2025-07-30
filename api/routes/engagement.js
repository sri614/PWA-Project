const express = require('express');
const router = express.Router();
const axios = require('axios');
const Task = require('../models/Task');
const validateUserId = require('../middleware/validateUserId');

const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const HEADERS = {
  Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
  'Content-Type': 'application/json'
};

// Build engagement payload
const buildEngagementPayload = (type, data, repName, timestamp) => {
  const baseEngagement = {
    engagement: { type },
    associations: {},
    metadata: {}
  };

  const title = `${data.title} by ${repName}`;

  // Associations
  if (data.contactId) baseEngagement.associations.contactIds = [data.contactId];
  if (data.dealId) baseEngagement.associations.dealIds = [data.dealId];

  // Type-specific metadata
  switch (type) {
    case 'NOTE':
      baseEngagement.metadata = { body: data.body, title };
      break;
    case 'call':
      engagementType = 'CALL';
      payload.engagementType = engagementType;
      payload.title = taskTitle;
      payload.body = callContent;
      break;
    case 'MEETING':
      baseEngagement.metadata = {
        body: data.body,
        title,
        startTime: timestamp
      };
      break;
    case 'TASK':
      baseEngagement.metadata = {
        subject: title,
        body: data.description,
        status: 'NOT_STARTED',
        forObjectType: 'CONTACT',
        dueDate: timestamp
      };
      break;
  }

  return baseEngagement;
};

// POST /engagements/create
router.post('/create', validateUserId, async (req, res) => {
  const {
    engagementType,   // 'NOTE', 'CALL', 'MEETING', 'TASK'
    contactId,
    dealId,
    title,
    body,
    description,
    dueDate,
    startTime
  } = req.body;

  const { user_id, name: sales_rep } = req.user;

  if (!contactId && !dealId) {
    return res.status(400).json({ success: false, message: 'Either contactId or dealId is required.' });
  }

  try {
    const timestamp = startTime || dueDate ? new Date(startTime || dueDate).getTime() : null;

    const payload = buildEngagementPayload(
      engagementType,
      { contactId, dealId, title, body, description },
      sales_rep,
      timestamp
    );

    const hubspotResponse = await axios.post(
      `${HUBSPOT_API_BASE}/engagements/v1/engagements`,
      payload,
      { headers: HEADERS }
    );

    const hubspotId = hubspotResponse.data.engagement.id;

    // If it's a TASK, save it in MongoDB too
    if (engagementType === 'TASK') {
      const mongoTask = await Task.create({
        engagementType,
        contactId,
        dealId,
        title: `${title} by ${sales_rep}`,
        dueDate,
        description,
        user_id: req.user.user_id,
        hubspotId
      });

      return res.status(200).json({
        success: true,
        hubspot: hubspotResponse.data,
        mongoTask
      });
    }

    res.status(200).json({
      success: true,
      hubspot: hubspotResponse.data
    });

  } catch (error) {
    console.error('Engagement creation error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to create engagement' });
  }
});

router.get('/tasks', validateUserId, async (req, res) => {
    const { user_id } = req.user;
  
    try {
      const tasks = await Task.find({ user_id }).sort({ dueDate: 1 });
  
      return res.status(200).json({
        success: true,
        tasks,
        count: tasks.length
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks'
      });
    }
  });

module.exports = router;
