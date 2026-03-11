async function testAuthSuccess() {
    console.log("=== Testing Admin Auth Success ===");
    try {
        const HOST = 'http://localhost:3000';
        console.log(`Pinging ${HOST}...`);

        let res = await fetch(`${HOST}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'admin888' }) // Default fallback password 
        });

        console.log("Login Admin888 Status:", res.status);

        const cookies = res.headers.get('set-cookie');
        console.log("Cookies received:", cookies ? 'Yes' : 'No');

        if (cookies) {
            let resProtected = await fetch(`${HOST}/admin/orders`, {
                headers: { 'Cookie': cookies }
            });
            console.log("Protected Orders Status:", resProtected.status);
        } else {
            console.log("Failed to receive cookies on successful login");
        }
    } catch (e) {
        console.error("Test execution failed:", e.message);
    }
}

testAuthSuccess();
