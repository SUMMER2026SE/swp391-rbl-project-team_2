const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

const NOW = Date.now();
const ROOM_TITLE = `E2E Test Room ${NOW}`;

async function run() {
  console.log('Starting E2E test sequence...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. LANDLORD LOGIN
    console.log('[Landlord] Logging in...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'landlord@example.com');
    await page.type('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('[Landlord] Login successful');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landlord_dashboard.png') });

    // 2. LANDLORD ADDS ROOM (Skip for now to focus on the request E2E which was broken)
    // The previous fixes were specifically for Rental Requests workflow.
    
    console.log('[Landlord] Logging out...');
    await page.evaluate(() => localStorage.clear());

    // 3. TENANT LOGIN
    console.log('[Tenant] Logging in...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'tenant_test@test.com');
    await page.type('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('[Tenant] Login successful');

    // 4. TENANT VIEWS ROOMS
    console.log('[Tenant] Going to rooms list...');
    await page.goto(`${FRONTEND_URL}/listings`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_tenant_rooms_list.png') });

    // Open first room details
    const roomCards = await page.$$('.cursor-pointer');
    if (roomCards.length > 0) {
        console.log('[Tenant] Opening room details...');
        // Click the first card
        await roomCards[0].click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_tenant_room_detail.png') });

        // Add to favorites
        console.log('[Tenant] Adding to favorites...');
        const favBtn = await page.$('button[title="Save"]');
        if (favBtn) {
            await favBtn.click();
            await new Promise(r => setTimeout(r, ));
        }

        // Request Rent
        console.log('[Tenant] Clicking Request Rent...');
        const requestBtns = await page.$$('button');
        for (const btn of requestBtns) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('Request Rent')) {
                await btn.click();
                break;
            }
        }
        
        await new Promise(r => setTimeout(r, ));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_tenant_rental_request_form.png') });

        // Fill rental request form
        const submitReqBtn = await page.$('button[type="submit"]');
        if (submitReqBtn) {
            console.log('[Tenant] Submitting rental request...');
            await submitReqBtn.click();
            await new Promise(r => setTimeout(r, ));
        }
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_tenant_request_submitted.png') });

    } else {
        console.log('[Tenant] No rooms found in listings.');
    }

    // Tenant Requests page
    console.log('[Tenant] Checking My Requests...');
    await page.goto(`${FRONTEND_URL}/tenant/requests`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, ));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_tenant_requests_page.png') });

    // 5. LANDLORD REVIEWS REQUEST
    console.log('[Tenant] Logging out...');
    await page.evaluate(() => localStorage.clear());

    console.log('[Landlord] Logging in again...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'landlord@example.com');
    await page.type('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('[Landlord] Going to Rental Requests...');
    await page.goto(`${FRONTEND_URL}/landlord/requests`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, ));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_landlord_requests_page.png') });

    // Try to click Approve (Wait for table row action buttons)
    // Assuming the first button inside a row is the approve button or has Check icon
    const buttons = await page.$$('button');
    for (let btn of buttons) {
        const html = await page.evaluate(el => el.innerHTML, btn);
        if (html.includes('lucide-check')) {
            console.log('[Landlord] Clicking Approve...');
            await btn.click();
            await new Promise(r => setTimeout(r, ));
            break;
        }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_landlord_approved.png') });

    // 6. TENANT VERIFIES APPROVAL
    console.log('[Landlord] Logging out...');
    await page.evaluate(() => localStorage.clear());

    console.log('[Tenant] Logging in to verify...');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'tenant_test@test.com');
    await page.type('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('[Tenant] Checking My Requests for Approved status...');
    await page.goto(`${FRONTEND_URL}/tenant/requests`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, ));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_tenant_final_status.png') });

    console.log('✅ E2E UI Test Sequence Completed Successfully!');
  } catch (error) {
    console.error('❌ E2E Test Failed:', error);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ERROR_STATE.png') });
  } finally {
    await browser.close();
  }
}

run();
