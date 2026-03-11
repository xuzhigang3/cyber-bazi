async function runTests() {
    console.log("=== Testing Cyber Bazi Admin Security ===");
    try {
        const HOST = 'http://127.0.0.1:8788';
        console.log(`Pinging ${HOST}...`);

        let res = await fetch(`${HOST}/admin/orders`, { redirect: 'manual' });
        console.log("[Test 1] GET /admin/orders (No Auth)");
        console.log("Expected: 307 Redirect. Actual:", res.status);

        res = await fetch(`${HOST}/admin/login`);
        console.log("[Test 2] GET /admin/login (No Auth)");
        console.log("Expected: 200 OK. Actual:", res.status);

        res = await fetch(`${HOST}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'wrong_password' })
        });
        console.log("[Test 3] POST /api/admin/login (Wrong Password)");
        console.log("Expected: 401 Unauthorized. Actual:", res.status);

    } catch (e) {
        console.error("Fetch failed. Is the server running on 8788?", e.message);
    }
}

runTests();
