import { Router } from 'express';
import { db } from '../firebaseAdmin.js';

const router = Router();
const ORDERS_COLLECTION = 'orders';
const OFFICIAL_UPI_ID = '9404692375@ybl';

/**
 * POST /api/orders
 * Place a new couture order
 */
router.post('/', async (req, res) => {
  try {
    const { 
      id,
      userId,
      items, 
      totalAmount,
      totalRaw,
      total,
      shippingAddress, 
      recipientName,
      address,
      phone,
      pincode,
      customerDetails,
      paymentMethod = 'UPI',
      status = 'pending_payment'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Shopping bag items are required' });
    }

    const orderId = id || `order_${Date.now()}`;
    const orderNumber = `SNX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      userId: userId || customerDetails?.phone || phone || 'guest',
      recipientName: recipientName || customerDetails?.name || '',
      phone: phone || customerDetails?.phone || '',
      address: address || shippingAddress?.street || '',
      pincode: pincode || shippingAddress?.pincode || '',
      items,
      total: total || `₹${Number(totalRaw || totalAmount || 0).toLocaleString('en-IN')}`,
      totalAmount: Number(totalRaw || totalAmount || 0),
      shippingAddress: shippingAddress || { address, pincode, recipientName, phone },
      customerDetails: customerDetails || { name: recipientName, phone },
      paymentMethod,
      upiId: OFFICIAL_UPI_ID,
      paymentStatus: 'Awaiting UTR',
      status: status || 'pending_payment',
      utrNumber: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: 'Client Atelier API'
    };

    // Save to Firestore / MemoryDb
    await db.collection(ORDERS_COLLECTION).doc(orderId).set(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete UPI payment and submit UTR.',
      data: newOrder
    });
  } catch (error) {
    console.error('[API Error: POST /api/orders]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/orders/:id/utr
 * Submit UPI transaction UTR / Reference ID for verification
 */
router.post('/:id/utr', async (req, res) => {
  try {
    const { id } = req.params;
    const { utrNumber, payerApp = 'UPI' } = req.body;

    if (!utrNumber || typeof utrNumber !== 'string' || utrNumber.trim().length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'A valid 6-22 digit UPI UTR / Reference number is required' 
      });
    }

    const cleanUTR = utrNumber.trim().toUpperCase();
    const orderRef = db.collection(ORDERS_COLLECTION).doc(id);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatePayload = {
      utrNumber: cleanUTR,
      payerApp,
      utrSubmittedAt: new Date().toISOString(),
      paymentStatus: 'UTR Submitted',
      status: 'utr_submitted',
      updatedAt: new Date().toISOString()
    };

    await orderRef.update(updatePayload);

    return res.json({
      success: true,
      message: 'UTR submitted successfully. Admin will verify your payment shortly.',
      orderId: id,
      utrNumber: cleanUTR,
      status: 'utr_submitted',
      data: {
        orderId: id,
        ...orderSnap.data(),
        ...updatePayload
      }
    });
  } catch (error) {
    console.error('[API Error: POST /api/orders/:id/utr]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/orders/user/:userId
 * Fetch order history for a specific customer strictly isolated to their userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    const snapshot = await db.collection(ORDERS_COLLECTION)
      .where('userId', '==', userId)
      .get();

    const orders = [];
    snapshot.forEach(docSnap => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });

    return res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('[API Error: GET /api/orders/user/:userId]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Fetch single order status by order ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection(ORDERS_COLLECTION).doc(id).get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    });
  } catch (error) {
    console.error(`[API Error: GET /api/orders/${req.params.id}]`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
