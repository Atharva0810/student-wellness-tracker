// FRONTEND app.js
const form = document.getElementById("wellnessForm");
const messageBox = document.getElementById("message");
const entriesDiv = document.getElementById("entries");

function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = "";
  messageBox.classList.add(type === "success" ? "success" : "warning");
  messageBox.classList.remove("hidden");
  setTimeout(() => messageBox.classList.add("hidden"), 7000);
}

function addEntryToView(doc) {
  const d = doc.data();
  const el = document.createElement("div");
  el.className = "entry";
  el.innerHTML = `
    <div><strong>${d.name || "Anonymous"}</strong> <small>— ${new Date(d.timestamp).toLocaleString()}</small></div>
    <div><small>Mood: ${d.mood} | Stress: ${d.stress} | Sleep: ${d.sleep} hrs</small></div>
    <div><small>Notes: ${d.notes || '-'}</small></div>
  `;
  entriesDiv.prepend(el);
}

function loadEntries(){
  db.collection('wellness').orderBy('timestamp','desc').limit(10).get()
    .then(snapshot=>{
      entriesDiv.innerHTML = '';
      snapshot.forEach(doc=> addEntryToView(doc));
    }).catch(err=>console.error(err));
}
loadEntries();

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const mood = document.getElementById('mood').value;
  const stress = Number(document.getElementById('stress').value);
  const sleep = Number(document.getElementById('sleep').value);
  const notes = document.getElementById('notes').value.trim();

  if(!mood || !stress || (!sleep && sleep !== 0)){
    showMessage('Please fill required fields','warning');
    return;
  }

  try{
    // Save to Firestore
    await db.collection('wellness').add({
      name: name || null,
      email: email || null,
      mood, stress, sleep, notes,
      timestamp: Date.now()
    });

    addEntryToView({
      data: () => ({ name, mood, stress, sleep, notes, timestamp: Date.now() })
    });

    // if high stress -> call backend to send email(s)
    if(stress >= 7){
      showMessage('⚠️ High stress detected — please attend a short consultation in Room 205 at 3 PM.','success');

      const API_URL = "https://student-wellness-tracker.onrender.com/"; 

      if(email){
        // change URL if you deploy backend elsewhere
        fetch(`${API_URL}/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            stress,
            message: 'We noticed that you’ve reported a high stress level recently. To support your well-being, wed like to invite you for a short, friendly consultation session 🕒 Time: 3:00 PM 📍 Location: DES Pune University, Room No. 303 Our goal is to help you manage stress effectively and ensure youre feeling your best. Please take this as an opportunity to talk and relax — you are not alone! Stay positive and take care of yourself. 💙 – Student Wellness Team'
          })
        })
        .then(r => r.json())
        .then(data => console.log('Email API response:', data))
        .catch(err => console.error('Email API error:', err));
      }
    } else {
      showMessage('Thank you! Your entry was saved successfully.');
    }

    form.reset();
  } catch(err){
    console.error(err);
    showMessage('Error saving data. Try again.', 'warning');
  }
});
