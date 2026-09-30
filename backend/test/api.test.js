import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      console.log(`[Client API Test Server] Running at: ${baseUrl}`);
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('Client Atelier API Test Suite', () => {
  
  test('1. Health Check Endpoint [GET /health]', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'online');
    assert.ok(data.service);
    assert.ok(data.timestamp);
  });

  test('2. Products Catalog [GET /api/products]', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);

    const first = data.data[0];
    assert.ok(first.id);
    assert.ok(first.title);
    assert.ok(typeof first.price === 'number');
    assert.ok(typeof first.stock === 'number');
  });

  test('3. Products Filter by Category [GET /api/products?category=Bridal%20%26%20Wedding]', async () => {
    const res = await fetch(`${baseUrl}/api/products?category=${encodeURIComponent('Bridal & Wedding')}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    for (const item of data.data) {
      assert.equal(item.category, 'Bridal & Wedding');
    }
  });

  test('4. Products Search [GET /api/products?search=Silk]', async () => {
    const res = await fetch(`${baseUrl}/api/products?search=Silk`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  test('5. Single Product by ID [GET /api/products/dress-1]', async () => {
    const res = await fetch(`${baseUrl}/api/products/dress-1`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.id, 'dress-1');
  });

  test('6. 360 Turnaround Dynamic Variant Preview [GET /api/products/dress-1/360-preview]', async () => {
    const res = await fetch(`${baseUrl}/api/products/dress-1/360-preview?color=Pure%20Pearl&size=M`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.preview);
    assert.equal(data.data.color, 'Pure Pearl');
    assert.equal(data.data.size, 'M');
  });

  test('7. Order Creation with Validation [POST /api/orders]', async () => {
    const testOrder = {
      id: `TEST-ORD-${Date.now()}`,
      userId: 'test-user-123',
      recipientName: 'Aarav Patel',
      phone: '9876543210',
      address: '402 Lotus Residency, Bandra West, Mumbai',
      pincode: '400050',
      items: [
        {
          id: 'dress-1',
          title: 'Celeste 360° Sculpted Silk Gown',
          selectedSize: 'M',
          selectedColor: 'Pure Pearl',
          quantity: 1,
          price: 24999
        }
      ],
      total: '₹24,999',
      totalRaw: 24999,
      paymentMethod: 'Bank Transfer / UPI (Pay Later / Submit UTR within 5 Days)'
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrder)
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.id, testOrder.id);
    assert.equal(data.data.status, 'pending_payment');
  });

  test('8. Submit UTR Payment Reference [POST /api/orders/:id/utr]', async () => {
    const orderId = `TEST-ORD-UTR-${Date.now()}`;
    // First create order
    await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        userId: 'test-user-123',
        recipientName: 'Aarav Patel',
        phone: '9876543210',
        items: [{ id: 'dress-1', price: 24999, quantity: 1 }],
        total: '₹24,999'
      })
    });

    // Now submit 12-digit UTR
    const res = await fetch(`${baseUrl}/api/orders/${orderId}/utr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utrNumber: '426819028491',
        payerApp: 'Google Pay'
      })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.utrNumber, '426819028491');
    assert.equal(data.data.status, 'utr_submitted');
  });

  test('9. User Isolated Orders History [GET /api/orders/user/:userId]', async () => {
    const res = await fetch(`${baseUrl}/api/orders/user/test-user-123`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  test('10. User Profile Read & Update [GET & PUT /api/users/:uid/profile]', async () => {
    const uid = 'test-uid-8942';
    const profilePayload = {
      name: 'Priya Sharma',
      phone: '9404692375',
      address: '12 Ring Road, Surat',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395002'
    };

    const putRes = await fetch(`${baseUrl}/api/users/${uid}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload)
    });

    assert.equal(putRes.status, 200);
    const putData = await putRes.json();
    assert.equal(putData.success, true);
    assert.equal(putData.data.name, 'Priya Sharma');

    const getRes = await fetch(`${baseUrl}/api/users/${uid}/profile`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.success, true);
    assert.equal(getData.data.name, 'Priya Sharma');
  });

  test('11. User Wishlist Read & Sync [GET & POST /api/users/:uid/wishlist]', async () => {
    const uid = 'test-uid-8942';
    const wishlistItems = ['dress-1', 'dress-3', 'dress-5'];

    const postRes = await fetch(`${baseUrl}/api/users/${uid}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: wishlistItems })
    });

    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.equal(postData.success, true);
    assert.deepEqual(postData.data, wishlistItems);

    const getRes = await fetch(`${baseUrl}/api/users/${uid}/wishlist`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.success, true);
    assert.deepEqual(getData.data, wishlistItems);
  });

  test('12. 404 Route Handling', async () => {
    const res = await fetch(`${baseUrl}/api/invalid-route`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
  });
});
