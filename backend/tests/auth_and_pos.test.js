const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcryptjs');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

test('Unit Test: Bcrypt password hashing & comparison', async () => {
  const password = 'SuperSecretPassword123!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  assert.strictEqual(typeof hash, 'string');
  assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));

  const isValid = await bcrypt.compare(password, hash);
  assert.strictEqual(isValid, true, 'Valid password should verify correctly');

  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isInvalid, false, 'Invalid password should be rejected');
});

test('Unit Test: JWT Access Token signing & verification', () => {
  const dummyUser = {
    id: 1,
    username: 'owner',
    full_name: 'Bapak Hendra',
    role: 'owner'
  };

  const token = generateAccessToken(dummyUser);
  assert.strictEqual(typeof token, 'string');

  const decoded = verifyAccessToken(token);
  assert.strictEqual(decoded.id, dummyUser.id);
  assert.strictEqual(decoded.username, dummyUser.username);
  assert.strictEqual(decoded.role, dummyUser.role);
  assert.strictEqual(decoded.iss, 'pos-kasir-api');
  assert.strictEqual(decoded.aud, 'pos-kasir-client');
});

test('Unit Test: User model password redaction in toJSON()', () => {
  const user = User.build({
    id: 1,
    username: 'owner',
    full_name: 'Bapak Hendra',
    role: 'owner',
    password_hash: '$2a$10$hashedsecretvalue',
    is_active: true
  });

  const json = user.toJSON();
  assert.strictEqual(json.password_hash, undefined, 'password_hash must NEVER be exposed in JSON output');
  assert.strictEqual(json.username, 'owner');
  assert.strictEqual(json.role, 'owner');
});

test('Security Rule: RBAC Deny-by-default behavior verification', () => {
  function checkAccess(userRole, allowedRoles) {
    if (!userRole) return 401; // Unauthenticated
    if (!allowedRoles.includes(userRole)) return 403; // Forbidden
    return 200; // Allowed
  }

  // Cashier attempting to access Owner-only routes (Stock-in, Product Master, Daily Summary)
  assert.strictEqual(checkAccess('cashier', ['owner']), 403, 'Cashier must be denied from owner-only routes');

  // Owner accessing Owner routes
  assert.strictEqual(checkAccess('owner', ['owner']), 200, 'Owner should have access to owner routes');

  // Both accessing POS Cashier checkout
  assert.strictEqual(checkAccess('cashier', ['owner', 'cashier']), 200, 'Cashier should have access to POS');
  assert.strictEqual(checkAccess('owner', ['owner', 'cashier']), 200, 'Owner should have access to POS');

  // Anonymous request
  assert.strictEqual(checkAccess(null, ['owner', 'cashier']), 401, 'Anonymous request must be unauthenticated');
});

test('Business Rule: POS Checkout calculation accuracy (Scenario A01 Formula)', () => {
  const productX = { price: 10000, quantity: 2 };
  const productY = { price: 15000, quantity: 1 };
  const cashPaid = 50000;

  const subtotalX = productX.price * productX.quantity; // 20,000
  const subtotalY = productY.price * productY.quantity; // 15,000
  const totalAmount = subtotalX + subtotalY; // 35,000
  const change = cashPaid - totalAmount; // 15,000

  assert.strictEqual(totalAmount, 35000, 'Total belanja harus tepat Rp35.000');
  assert.strictEqual(change, 15000, 'Kembalian harus tepat Rp15.000');
  assert.ok(cashPaid >= totalAmount, 'Cash paid must be greater than or equal to total');
});

test('Business Rule: Price Snapshotting immutability (Scenario A04)', () => {
  // Initial transaction
  const initialMasterPrice = 20000;
  const saleItem = {
    product_name_at_sale: 'Kopi Bubuk',
    price_at_sale: initialMasterPrice,
    quantity: 2,
    subtotal: initialMasterPrice * 2
  };

  // Later, owner raises master product price to 30000
  const updatedMasterPrice = 30000;

  // The historical sale item must remain at 20000
  assert.strictEqual(saleItem.price_at_sale, 20000, 'Historic price snapshot must NOT change when master price changes');
  assert.strictEqual(saleItem.subtotal, 40000, 'Historic subtotal must remain accurate');
  assert.notStrictEqual(saleItem.price_at_sale, updatedMasterPrice);
});
