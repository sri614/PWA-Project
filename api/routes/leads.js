const express = require('express');
const router = express.Router();
const axios = require('axios');
const validateUserId = require('../middleware/validateUserId');
const User = require('../models/User');

const hubHeader = {
    "headers":{
        'Authorization': `Bearer ${process.env.HUBSPOT_TOKEN}`
    }
}

router.post('/', validateUserId, async (req, res) => {
  const {
    email,
    phone,
    hs_lead_status,
    sales_representative,
    firstname,
    product_interest,
    company,
    jobtitle,
    industry
  } = req.body;

  const properties = {
    hs_lead_status,
    sales_representative,
    email,
    phone,
    firstname,
    product_interest,
    company,
    jobtitle,
    industry
  };

  try {
    // Case 1: Email is provided → upsert by email
    if (email) {
      const upsertByEmail = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert',
        {
          inputs: [
            {
              idProperty: "email",
              id: email,
              properties
            }
          ]
        },
        hubHeader
      );

      return res.status(200).json({
        success: true,
        contact: upsertByEmail.data.results[0]
      });
    }else{
      const searchResult = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'phone',
                  operator: 'EQ',
                  value: phone
                }
              ]
            }
          ]
        },
        hubHeader
      );

      const results = searchResult.data.results;

      if (results.length > 0) {
        // Update existing contact
        const contactId = results[0].id;
        const updateContact = await axios.patch(
          'https://api.hubapi.com/crm/v3/objects/contacts/${contactId}',
          { properties },
          hubHeader
        );

        return res.status(200).json({
          success: true,
          contact: updateContact.data
        });
      } else {
        // Create new contact with phone
        const newContact = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          { properties },
          hubHeader
        );

        return res.status(200).json({
          success: true,
          contact: newContact.data
        });
      }
    }

    // Neither email nor phone is present
    return res.status(400).json({
      success: false,
      message: 'Missing both email and phone in request payload'
    });

  } catch (error) {
    console.error('HubSpot upsert error:', error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Error upserting contact',
      error: error?.response?.data || error.message
    });
  }
});

router.get('/', validateUserId, async (req, res) => {
    const {user_id} = req.user;
  
    try {
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'sales_representative',
                  operator: 'EQ',
                  value: user_id
                }
              ]
            }
          ],
          properties: [
            'phone', 'email', 'firstname', 'date_of_birth', 'createdate',
            'jobtitle', 'region', 'industry', 'product_interest', 'sales_representative',
            'sales_manager', 'company', 'hs_lead_status', 'assigned_at'
          ],
          limit: 200,
          sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }]
        },
        hubHeader
      );
  
      const leads = response.data.results;
      return res.status(200).json({
        success: true,
        leads,
        total: response.data.total
      });
  
    } catch (error) {
      console.error('Error fetching HubSpot leads:', error.response?.data || error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch leads from HubSpot' });
    }
  });

  router.get('/:contactId', validateUserId, async (req, res) => {
    const { contactId } = req.params;
    const { user_id } = req.user;
  
    try {
      // Step 1: Fetch contact by ID and verify it's assigned to the user
      const contactResponse = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/contacts/search',
        {
          filterGroups: [
            {
              filters: [
                { propertyName: 'hs_object_id', operator: 'EQ', value: contactId },
                { propertyName: 'sales_representative', operator: 'EQ', value: user_id }
              ]
            }
          ],
          properties: [
            'phone', 'email', 'firstname', 'lastname', 'date_of_birth',
            'jobtitle', 'region', 'industry', 'product_interest',
            'sales_representative', 'sales_manager', 'company',
            'hs_lead_status', 'assigned_at', 'createdate', 'lastmodifieddate'
          ],
          limit: 1
        },
        hubHeader
      );
  
      const results = contactResponse.data.results;
  
      if (!results.length) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found or not assigned to this user'
        });
      }
  
      const contact = results[0];
  
      // Step 2: Fetch associated deals
      const dealsResponse = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/deals/search',
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'associations.contact',
                  operator: 'EQ',
                  value: contactId
                }
              ]
            }
          ],
          properties: [
            'createdate', 'dealstage', 'dealname', 'sub_status',
            'closedate', 'amount', 'quantity',
            'hs_deal_stage_probability', 'sales_manager', 'sales_representative'
          ],
          sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
          limit: 200
        },
        hubHeader
      );
  
      const deals = dealsResponse.data.results || [];
  
      // Final response with contact and deals
      return res.status(200).json({
        success: true,
        contact,
        deals
      });
  
    } catch (error) {
      console.error('Error fetching contact or deals:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch contact or associated deals'
      });
    }
  });

  router.get('/:contactId/engagements', validateUserId, async (req, res) => {
    const { contactId } = req.params;
  
    try {
      const response = await axios.get(
        `https://api.hubapi.com/engagements/v1/engagements/associated/contact/${contactId}/paged?limit=100`,
        hubHeader
      );
      return res.status(200).json({
        success: true,
        engagements: response.data.results || [],
        hasMore: response.data.hasMore || false,
        offset: response.data.offset || null
      });
  
    } catch (error) {
      console.error('Error fetching engagements:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch contact engagements'
      });
    }
  });

  router.patch('/:contactId', validateUserId, async (req, res) => {
    const { contactId } = req.params;
    const propertiesToUpdate = req.body; // Should contain only the properties to update
  
    // Valid HubSpot fields (same as your contact detail fetch)
    const allowedFields = new Set([
      'phone', 'email', 'firstname', 'lastname', 'date_of_birth',
      'jobtitle', 'region', 'industry', 'product_interest',
      'sales_representative', 'sales_manager', 'company',
      'hs_lead_status', 'assigned_at'
    ]);
  
    // Filter only valid properties to update
    const properties = Object.fromEntries(
      Object.entries(propertiesToUpdate).filter(([key]) => allowedFields.has(key))
    );
  
    if (Object.keys(properties).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid properties provided for update'
      });
    }
  
    try {
      const updateResponse = await axios.patch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        { properties },
        hubHeader
      );
  
      return res.status(200).json({
        success: true,
        updatedProperties: updateResponse.data.properties
      });
  
    } catch (error) {
      console.error('Error updating contact:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to update contact'
      });
    }
  });
  

module.exports = router