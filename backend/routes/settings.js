import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SHARED_SETTINGS_PATH = path.resolve(__dirname, '../../../store_settings.json');

function loadSharedSettings() {
  try {
    if (fs.existsSync(SHARED_SETTINGS_PATH)) {
      const raw = fs.readFileSync(SHARED_SETTINGS_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Client Settings] Error reading store_settings.json:', err.message);
  }
  return null;
}

const DEFAULT_SETTINGS = {
  upiId: '9404692375@ybl',
  merchantName: 'Sonex Enterprises Luxury Couture',
  supportPhone: '+91 9404692375',
  supportEmail: 'concierge@sonexenterprises.com',
  suratFactoryPoolingEnabled: true,
  refundPolicyDays: 30,
  checkoutPricing: {
    shippingPrice: 49,
    isFreeShipping: false,
    freeShippingThreshold: 25000,
    enableFreeShippingThreshold: true,
    gstPercentage: 5,
    gstCalculationMode: 'product_plus_shipping'
  },
  socialLinks: {
    instagram: { url: 'https://instagram.com/sonexenterprises', enabled: true },
    youtube: { url: 'https://youtube.com/@sonexenterprises', enabled: true },
    twitter: { url: 'https://x.com/sonexenterprises', enabled: true },
    facebook: { url: 'https://facebook.com/sonexenterprises', enabled: true }
  },
  updatedAt: new Date().toISOString()
};

/**
 * GET /api/settings
 */
router.get('/', (req, res) => {
  const diskSettings = loadSharedSettings() || {};
  const combined = {
    ...DEFAULT_SETTINGS,
    ...diskSettings,
    checkoutPricing: {
      ...DEFAULT_SETTINGS.checkoutPricing,
      ...(diskSettings.checkoutPricing || {})
    },
    socialLinks: {
      ...DEFAULT_SETTINGS.socialLinks,
      ...(diskSettings.socialLinks || {})
    }
  };
  return res.json({ success: true, data: combined });
});

/**
 * GET /api/settings/pricing
 */
router.get('/pricing', (req, res) => {
  const diskSettings = loadSharedSettings() || {};
  const pricing = diskSettings.checkoutPricing || DEFAULT_SETTINGS.checkoutPricing;
  return res.json({ success: true, data: pricing });
});

export default router;
