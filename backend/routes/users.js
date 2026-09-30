import { Router } from 'express';
import { db } from '../firebaseAdmin.js';

const router = Router();
const USERS_COLLECTION = 'users';

/**
 * GET /api/users/:uid/profile
 * Get user profile and measurements
 */
router.get('/:uid/profile', async (req, res) => {
  try {
    const { uid } = req.params;
    const docSnap = await db.collection(USERS_COLLECTION).doc(uid).get();

    if (!docSnap.exists) {
      return res.json({
        success: true,
        data: {
          uid,
          name: '',
          phone: '',
          email: '',
          addresses: [],
          measurements: {},
          createdAt: new Date().toISOString()
        }
      });
    }

    return res.json({
      success: true,
      data: docSnap.data()
    });
  } catch (error) {
    console.error('[API Error: GET /api/users/:uid/profile]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/users/:uid/profile
 * Update user profile
 */
router.put('/:uid/profile', async (req, res) => {
  try {
    const { uid } = req.params;
    const profileData = req.body;

    const payload = {
      ...profileData,
      uid,
      updatedAt: new Date().toISOString()
    };

    await db.collection(USERS_COLLECTION).doc(uid).set(payload, { merge: true });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: payload
    });
  } catch (error) {
    console.error('[API Error: PUT /api/users/:uid/profile]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/users/:uid/wishlist
 */
router.get('/:uid/wishlist', async (req, res) => {
  try {
    const { uid } = req.params;
    const docSnap = await db.collection(USERS_COLLECTION).doc(uid).collection('state').doc('wishlist').get();

    if (!docSnap.exists) {
      return res.json({ success: true, data: [] });
    }

    return res.json({ success: true, data: docSnap.data().items || [] });
  } catch (error) {
    console.error('[API Error: GET /api/users/:uid/wishlist]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/users/:uid/wishlist
 */
router.post('/:uid/wishlist', async (req, res) => {
  try {
    const { uid } = req.params;
    const { items = [] } = req.body;

    await db.collection(USERS_COLLECTION).doc(uid).collection('state').doc('wishlist').set({
      items,
      updatedAt: new Date().toISOString()
    });

    return res.json({ 
      success: true, 
      count: items.length, 
      data: items,
      message: 'Wishlist synced successfully' 
    });
  } catch (error) {
    console.error('[API Error: POST /api/users/:uid/wishlist]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
