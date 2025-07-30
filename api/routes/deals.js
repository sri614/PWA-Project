const express = require('express');
const router = express.Router();
const axios = require('axios');
const validateUserId = require('../middleware/validateUserId');

const hubHeader = {
  headers: {
    Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const allowedFields = new Set([
  'dealname', 'dealstage', 'pipeline', 'amount', 'quantity',
  'hs_deal_stage_probability', 'sub_status', 'closedate',
  'sales_representative', 'sales_manager', 'product_interest',
  'lost_reason'
]);

// 🔁 POST /deals - Create a Deal
router.post('/', validateUserId, async (req, res) => {
  const {
    dealname, dealstage, pipeline, amount, quantity,
    sub_status, closedate, sales_representative,
    sales_manager, product_interest, lost_reason,
    associated_contact
  } = req.body;

  const properties = {
    dealname,
    dealstage,
    pipeline,
    amount,
    quantity,
    sub_status,
    closedate,
    sales_representative,
    sales_manager,
    product_interest,
    lost_reason
  };

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/deals',
      { properties },
      hubHeader
    );

    const dealId = response.data.id;

    // Optionally associate with a contact
    if (associated_contact) {
      await axios.put(
        `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contact/${associated_contact}/deal_to_contact`,
        {},
        hubHeader
      );
    }

    return res.status(200).json({ success: true, deal: response.data });
  } catch (error) {
    console.error('Error creating deal:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to create deal' });
  }
});

// 📄 GET /deals - Get deals by sales representative
router.get('/', validateUserId, async (req, res) => {
  const { user_id } = req.user;

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/deals/search',
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
        properties: Array.from(allowedFields),
        sorts: [{ propertyName: 'createdate', direction: 'ASCENDING' }],
        limit: 200
      },
      hubHeader
    );

    return res.status(200).json({
      success: true,
      deals: response.data.results,
      total: response.data.total
    });
  } catch (error) {
    console.error('Error fetching deals:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch deals' });
  }
});

// 🔍 GET /deals/products?ids=123,456
router.get('/products', validateUserId, async (req, res) => {
    const ids = (req.query.ids || '').split(',').map(id => id.trim()).filter(Boolean);
  
    if (!ids.length) {
      return res.status(400).json({ success: false, message: 'No product IDs provided' });
    }
  
    try {
      const response = await axios.post(
        'https://api.hubapi.com/crm/v3/objects/products/batch/read',
        {
          idProperty: 'hs_object_id',
          inputs: ids.map(id => ({ id })),
          properties: ['name', 'price', 'description']
        },
        hubHeader
      );
  
      return res.status(200).json({ success: true, products: response.data.results });
    } catch (error) {
      console.error('Error fetching products:', error?.response?.data || error.message);
      return res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
  });

// 🔍 GET /deals/:dealId - Get a deal by ID
router.get('/:dealId', validateUserId, async (req, res) => {
  const { dealId } = req.params;

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${Array.from(allowedFields).join(',')}`,
      hubHeader
    );

    return res.status(200).json({
      success: true,
      deal: response.data
    });
  } catch (error) {
    console.error('Error fetching deal by ID:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch deal' });
  }
});



// ✏️ PATCH /deals/:dealId - Update a deal
router.patch('/:dealId', validateUserId, async (req, res) => {
  const { dealId } = req.params;
  const updateFields = req.body;

  const properties = Object.fromEntries(
    Object.entries(updateFields).filter(([key]) => allowedFields.has(key))
  );

  if (Object.keys(properties).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid properties provided for update'
    });
  }

  try {
    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`,
      { properties },
      hubHeader
    );

    return res.status(200).json({
      success: true,
      updatedProperties: response.data.properties
    });
  } catch (error) {
    console.error('Error updating deal:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to update deal' });
  }
});


// ➕ POST /deals/:dealId/line-items
router.post('/:dealId/line-items', validateUserId, async (req, res) => {
  const { dealId } = req.params;
  const { productId, quantity, price } = req.body;

  if (!productId || !quantity || !price) {
    return res.status(400).json({ success: false, message: 'Missing productId, quantity, or price' });
  }

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/line_items',
      {
        associations: [
          {
            to: { id: dealId },
            types: [
              {
                associationCategory: 'HUBSPOT_DEFINED',
                associationTypeId: 20 // Deal → Line Item
              }
            ]
          }
        ],
        properties: {
          hs_product_id: productId,
          quantity,
          price
        }
      },
      hubHeader
    );

    return res.status(200).json({ success: true, lineItem: response.data });
  } catch (error) {
    console.error('Error creating line item:', error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Failed to create line item' });
  }
});

router.get('/:dealId/engagements', validateUserId, async (req, res) => {
    const { dealId } = req.params;
  
    try {
      const response = await axios.get(
        `https://api.hubapi.com/engagements/v1/engagements/associated/deal/${dealId}/paged?limit=100`,
        hubHeader
      );
  
      return res.status(200).json({
        success: true,
        engagements: response.data.results || [],
        hasMore: response.data.hasMore || false,
        offset: response.data.offset || null
      });
  
    } catch (error) {
      console.error('Error fetching deal engagements:', error?.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch engagements for deal'
      });
    }
  });

module.exports = router;
