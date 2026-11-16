// ==============================================================================
// Full-Stack Functionality & End-to-End Verification Test Suite
// ==============================================================================

const http = require('http');

function apiCall(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5050,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('===========================================================================');
  console.log(' STARTING END-TO-END PROJECT FUNCTIONALITY VERIFICATION');
  console.log('===========================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(` \x1b[32m✓ [PASS]\x1b[0m ${testName}`);
      passed++;
    } else {
      console.error(` \x1b[31m✗ [FAIL]\x1b[0m ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Reset Database to Clean Baseline
    const resetRes = await apiCall('/api/reset', 'POST');
    assert(resetRes.status === 200 && resetRes.data.success, 'Test 1: POST /api/reset resets database to baseline');

    // 2. Test /api/stats baseline
    const statsRes = await apiCall('/api/stats');
    assert(statsRes.status === 200, 'Test 2: GET /api/stats returns HTTP 200');
    assert(statsRes.data.total_customers === 5, 'Test 2.1: total_customers is exactly 5', `Got: ${statsRes.data.total_customers}`);
    assert(statsRes.data.total_products === 6, 'Test 2.2: total_products is exactly 6', `Got: ${statsRes.data.total_products}`);
    assert(statsRes.data.total_orders === 6, 'Test 2.3: total_orders is exactly 6', `Got: ${statsRes.data.total_orders}`);
    assert(statsRes.data.order_item_records === 10, 'Test 2.4: order_item_records is exactly 10', `Got: ${statsRes.data.order_item_records}`);
    assert(statsRes.data.successful_payment_revenue === 100200, 'Test 2.5: successful_payment_revenue is ₹100,200', `Got: ${statsRes.data.successful_payment_revenue}`);
    assert(statsRes.data.low_stock_products === 2, 'Test 2.6: low_stock_products count is 2 (Headphones & Monitor)', `Got: ${statsRes.data.low_stock_products}`);

    // 3. Test /api/products catalog
    const prodRes = await apiCall('/api/products');
    assert(prodRes.status === 200 && Array.isArray(prodRes.data), 'Test 3: GET /api/products returns array of 6 items');
    assert(prodRes.data.length === 6, 'Test 3.1: 6 catalog items present');
    const mouse = prodRes.data.find(p => p.product_id === 2);
    assert(mouse && mouse.stock_quantity === 50, 'Test 3.2: Product #2 (Wireless Mouse) has initial stock of 50', `Got: ${mouse?.stock_quantity}`);

    // 4. Test /api/customers
    const custRes = await apiCall('/api/customers');
    assert(custRes.status === 200 && custRes.data.length === 5, 'Test 4: GET /api/customers returns 5 registered customers');

    // 5. Test /api/inventory
    const invRes = await apiCall('/api/inventory');
    assert(invRes.status === 200 && invRes.data.length === 6, 'Test 5: GET /api/inventory returns 6 stock entries');
    const lowStock = invRes.data.filter(i => i.stock_quantity < 5);
    assert(lowStock.length === 2, 'Test 5.1: Exactly 2 SKUs are below safety threshold (< 5)');

    // 6. Test Storefront Checkout: Placing a real order via POST /api/orders/create
    console.log('\n--- Testing Storefront Checkout & Atomic Transaction ---');
    const newOrderPayload = {
      customer_id: 2, // Priya Verma (Mumbai)
      payment_method: 'UPI',
      payment_status: 'SUCCESS',
      items: [
        { product_id: 2, quantity: 2, unit_price: 800.00 }, // 2x Mouse = 1600
        { product_id: 3, quantity: 1, unit_price: 3000.00 } // 1x Keyboard = 3000
      ]
    };
    const orderRes = await apiCall('/api/orders/create', 'POST', newOrderPayload);
    assert(orderRes.status === 200 && orderRes.data.success, 'Test 6: POST /api/orders/create executes atomic transaction');
    assert(orderRes.data.order && orderRes.data.order.order_total === 4600, 'Test 6.1: Calculated total is ₹4,600.00', `Got: ${orderRes.data.order?.order_total}`);
    const createdOrderId = orderRes.data.order.order_id;
    assert(createdOrderId > 6, `Test 6.2: New Order ID generated (#ORD-100${createdOrderId})`);

    // 7. Verify Inventory Decrement & Trigger
    const invAfterRes = await apiCall('/api/inventory');
    const mouseAfter = invAfterRes.data.find(p => p.product_id === 2);
    assert(mouseAfter && mouseAfter.stock_quantity === 48, 'Test 7: Product #2 stock decremented from 50 to 48', `Got: ${mouseAfter?.stock_quantity}`);
    const kbAfter = invAfterRes.data.find(p => p.product_id === 3);
    assert(kbAfter && kbAfter.stock_quantity === 24, 'Test 7.1: Product #3 stock decremented from 25 to 24', `Got: ${kbAfter?.stock_quantity}`);

    // 8. Test /api/orders to verify new order appears at top
    const ordersRes = await apiCall('/api/orders');
    assert(ordersRes.status === 200 && ordersRes.data.length === 7, 'Test 8: Orders list now contains 7 total orders');
    const topOrder = ordersRes.data[0];
    assert(topOrder.order_id === createdOrderId, 'Test 8.1: Newly created order is at the top of the queue');
    assert(topOrder.customer_name === 'Priya Verma', 'Test 8.2: Customer name correctly joined (Priya Verma)');

    // 9. Test Order Status Update: Advance order from PAID -> SHIPPED -> DELIVERED
    console.log('\n--- Testing Fulfillment Status Progression ---');
    const updateStatusRes = await apiCall('/api/orders/update-status', 'POST', {
      order_id: createdOrderId,
      status: 'SHIPPED'
    });
    assert(updateStatusRes.status === 200 && updateStatusRes.data.success, 'Test 9: POST /api/orders/update-status advances status to SHIPPED');

    // 10. Test Manual Inventory Adjustment (+1 / -1)
    console.log('\n--- Testing Warehouse Stock Adjustments ---');
    const adjustRes = await apiCall('/api/inventory/update', 'POST', {
      product_id: 2,
      stock_quantity: 49
    });
    assert(adjustRes.status === 200 && adjustRes.data.success, 'Test 10: POST /api/inventory/update modifies stock to 49');
    assert(adjustRes.data.updated[0].stock_quantity === 49, 'Test 10.1: Stock quantity is 49');
    assert(adjustRes.data.updated[0].last_updated !== null, 'Test 10.2: Trigger timestamp updated');

    // 11. Final Reset to restore benchmark sample data for demonstration
    await apiCall('/api/reset', 'POST');
    const finalStats = await apiCall('/api/stats');
    assert(finalStats.data.total_orders === 6 && finalStats.data.successful_payment_revenue === 100200, 'Test 11: Final reset returns database to clean 6 orders / ₹100,200 benchmark baseline');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log('\n===========================================================================');
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('===========================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
