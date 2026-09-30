import { Router } from 'express';
import { db, SEED_PRODUCTS } from '../firebaseAdmin.js';

const router = Router();
const PRODUCTS_COLLECTION = 'products';
const DEFAULT_PRODUCTS = SEED_PRODUCTS;

/**
 * GET /api/products
 * Fetch visible dresses with optional category filter
 */
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  try {
    let queryRef = db.collection(PRODUCTS_COLLECTION);
    const snapshot = await queryRef.get();

    let items = [];
    if (!snapshot.empty) {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.hidden) {
          items.push({ id: doc.id, ...data });
        }
      });
    }

    if (items.length === 0) {
      items = [...DEFAULT_PRODUCTS];
    }

    // Apply category filter
    if (category && category !== 'All Dresses' && category !== 'All Lehengas') {
      items = items.filter(item => 
        (item.category || '').toLowerCase() === category.toLowerCase()
      );
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase().trim();
      items = items.filter(item => 
        (item.title || '').toLowerCase().includes(q) ||
        (item.material || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('[API Error: GET /api/products]', error);
    let fallbackItems = [...DEFAULT_PRODUCTS];
    if (category && category !== 'All Dresses' && category !== 'All Lehengas') {
      fallbackItems = fallbackItems.filter(item => 
        (item.category || '').toLowerCase() === category.toLowerCase()
      );
    }
    if (search) {
      const q = search.toLowerCase().trim();
      fallbackItems = fallbackItems.filter(item => 
        (item.title || '').toLowerCase().includes(q) ||
        (item.material || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return res.json({
      success: true,
      count: fallbackItems.length,
      data: fallbackItems,
      fallback: true
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a specific product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docSnap = await db.collection(PRODUCTS_COLLECTION).doc(id).get();

    if (!docSnap.exists) {
      const fallbackItem = DEFAULT_PRODUCTS.find(p => p.id === id);
      if (fallbackItem) {
        return res.json({ success: true, data: fallbackItem });
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.json({
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    });
  } catch (error) {
    console.error(`[API Error: GET /api/products/${req.params.id}]`, error);
    const fallbackItem = DEFAULT_PRODUCTS.find(p => p.id === req.params.id);
    if (fallbackItem) {
      return res.json({ success: true, data: fallbackItem, fallback: true });
    }
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
});

/**
 * GET /api/products/:id/360-preview
 * Resolves active 360 video and frames tailored to selected color and size
 */
router.get('/:id/360-preview', async (req, res) => {
  try {
    const { id } = req.params;
    const { color, size } = req.query;

    let product = null;
    const docSnap = await db.collection(PRODUCTS_COLLECTION).doc(id).get();
    if (docSnap.exists) {
      product = { id: docSnap.id, ...docSnap.data() };
    } else {
      product = DEFAULT_PRODUCTS.find(p => p.id === id) || DEFAULT_PRODUCTS[0];
    }

    const colorName = (color || '').trim().toLowerCase();
    const sizeName = (size || '').trim().toUpperCase();

    let matchedVideo = null;
    let matchedFrames = null;
    let sourceType = 'default';
    let label = 'Standard 360° Studio';

    // 1. Check exact variant override
    if (Array.isArray(product.variantVideos)) {
      const match = product.variantVideos.find(v => 
        (v.color || '').toLowerCase() === colorName &&
        (v.size || '').toUpperCase() === sizeName &&
        (v.videoSrc || v.framesFolder)
      );
      if (match) {
        matchedVideo = match.videoSrc;
        matchedFrames = match.framesFolder;
        sourceType = 'variant';
        label = `${color} • Size ${size}`;
      }
    }

    // 2. Check color specific
    if (!matchedVideo && colorName && Array.isArray(product.colors)) {
      const colMatch = product.colors.find(c => (c.name || '').toLowerCase() === colorName);
      if (colMatch && (colMatch.videoSrc || colMatch.framesFolder)) {
        matchedVideo = colMatch.videoSrc;
        matchedFrames = colMatch.framesFolder;
        sourceType = 'color';
        label = `Color: ${colMatch.name}`;
      }
    }

    // 3. Check size specific
    if (!matchedVideo && sizeName && product.sizeVideos && product.sizeVideos[sizeName]) {
      const sv = product.sizeVideos[sizeName];
      matchedVideo = typeof sv === 'string' ? sv : sv.videoSrc;
      matchedFrames = typeof sv === 'object' ? sv.framesFolder : null;
      sourceType = 'size';
      label = `Size: ${sizeName}`;
    }

    const videoSrc = matchedVideo || product.videoSrc || '/showcase_v2.mp4';
    const framesFolder = matchedFrames || product.framesFolder || '/showcase_v2_frames';

    return res.json({
      success: true,
      videoSrc,
      framesFolder,
      sourceType,
      label,
      data: {
        preview: videoSrc,
        videoSrc,
        framesFolder,
        color: color || '',
        size: size || '',
        sourceType,
        label
      }
    });
  } catch (error) {
    console.error('[API Error: 360-preview]', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
