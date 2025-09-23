// Test script to verify existing member flow
const fetch = require('node-fetch');

async function testExistingMemberFlow() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('=== Testing Existing Member Flow ===\n');
    
    // Step 1: Login as existing member
    console.log('1. Logging in as existing.member@email.com...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'existing.member@email.com' })
    });
    
    if (!loginRes.ok) {
        console.error('❌ Login failed:', await loginRes.text());
        return;
    }
    
    const loginData = await loginRes.json();
    console.log('✅ Login successful:', loginData);
    
    // Get cookies
    const cookies = loginRes.headers.get('set-cookie');
    console.log('Cookies set:', cookies);
    
    // Step 2: Check if application exists
    console.log('\n2. Checking application test-app-existing...');
    const appRes = await fetch(`${baseUrl}/member/apply/test-app-existing`, {
        headers: { 
            'Cookie': cookies,
            'Accept': 'text/html'
        }
    });
    
    if (!appRes.ok) {
        console.error('❌ Failed to load application page');
        return;
    }
    
    const html = await appRes.text();
    
    // Step 3: Check for key features
    console.log('\n3. Checking for existing member features:');
    
    const hasProfileTab = html.includes('Profile') && html.includes('From Universa');
    console.log(hasProfileTab ? '✅ Profile tab found' : '❌ Profile tab NOT found');
    
    const hasRobertJohnson = html.includes('Robert Johnson');
    console.log(hasRobertJohnson ? '✅ User name found' : '❌ User name NOT found');
    
    const hasPrefilledData = html.includes('95000') || html.includes('Tech Solutions Inc');
    console.log(hasPrefilledData ? '✅ Prefilled data found' : '❌ Prefilled data NOT found');
    
    // Step 4: Extract relevant HTML sections
    console.log('\n4. HTML Analysis:');
    
    // Look for the tabs section
    const tabsMatch = html.match(/<nav class="-mb-px flex.*?<\/nav>/s);
    if (tabsMatch) {
        console.log('Tabs HTML:', tabsMatch[0].substring(0, 200) + '...');
    }
    
    // Look for user email in the HTML
    const emailMatches = html.match(/existing\.member@email\.com/g);
    console.log(`Found email ${emailMatches ? emailMatches.length : 0} times in HTML`);
    
    console.log('\n=== Test Complete ===');
}

testExistingMemberFlow().catch(console.error);