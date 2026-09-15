const fs = require('fs');
const FormData = require('form-data');

async function runTest() {
  const loginRes = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test_verification@example.com", password: "password123" })
  });

  const { accessToken } = await loginRes.json();
  
  const familyRes = await fetch("http://localhost:8080/api/families/me", {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!familyRes.ok) {
     console.log("No family yet. Creating one...");
     const createFamilyRes = await fetch("http://localhost:8080/api/families", {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
       body: JSON.stringify({ familyName: "Test Family" })
     });
     
     const family = await createFamilyRes.json();
     console.log("Created Family ID:", family.id);
     
     // create member
     await fetch(`http://localhost:8080/api/families/${family.id}/members`, {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
       body: JSON.stringify({ firstName: "Test", lastName: "User", gender: "MALE", dateOfBirth: "2000-01-01", relationshipToOwner: "SELF" })
     });
  }

  const finalFamilyRes = await fetch("http://localhost:8080/api/families/me", {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const meData = await finalFamilyRes.json();
  const memberId = meData.members[0].id;
  console.log("Logged in, Member ID:", memberId);

  fs.writeFileSync('dummy.pdf', '%PDF-1.4 dummy content');
  
  const form = new FormData();
  form.append('file', fs.createReadStream('dummy.pdf'));
  form.append('documentType', 'LAB_REPORT');

  console.log("Uploading document...");
  const uploadRes = await fetch(`http://localhost:8080/api/members/${memberId}/documents`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` },
    body: form,
    duplex: 'half'
  });

  if (!uploadRes.ok) {
     console.log("Upload failed:", uploadRes.status, await uploadRes.text());
     return;
  }
  const document = await uploadRes.json();
  console.log(`Document uploaded! ID: ${document.documentId}`);

  let attempts = 0;
  while (attempts < 30) {
    const statusRes = await fetch(`http://localhost:8080/api/documents/${document.documentId}/status`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (statusRes.ok) {
       const status = await statusRes.json();
       console.log(`[Attempt ${attempts + 1}] Stage: ${status.stage} | Message: ${status.message}`);
       
       if (status.stage === 'COMPLETED' || status.stage === 'FAILED') {
         break;
       }
    } else {
       console.log("Status check failed:", statusRes.status);
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

runTest().catch(console.error);
