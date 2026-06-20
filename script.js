// ==========================================
// FIREBASE INITIALIZATION (Aapka Secret Code)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCST-OSQ31-ooEnhoqxRzsR8oNVzvP-nc8",
  authDomain: "junior-cricket-league.firebaseapp.com",
  projectId: "junior-cricket-league",
  storageBucket: "junior-cricket-league.firebasestorage.app",
  messagingSenderId: "720988088138",
  appId: "1:720988088138:web:be442925d21763174fc3b3",
  measurementId: "G-H0PN7T1TQD"
};

// Firebase Services active karna Compat Mode me (Best for Windows 8 Browsers)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// ==========================================
// THEME TOGGLE FUNCTIONALITY
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        icon.className = document.body.classList.contains('light-theme') ? 'fas fa-sun' : 'fas fa-moon';
    });
}

// ==========================================
// ADMIN PANEL LOGIN
// ==========================================
function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('login-error');
    
    if (passwordInput === 'JuniorTeam') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminCurrentData();
        loadAdminGalleryPreview();
    } else {
        errorMsg.style.display = 'block';
    }
}

// ==========================================
// CLOUD DATABASE OPERATIONS (FIRESTORE)
// ==========================================

function savePointsTable() {
    const teamId = document.getElementById('updateTeamSelect').value;
    const wins = parseInt(document.getElementById('teamWins').value) || 0;
    const losses = parseInt(document.getElementById('teamLosses').value) || 0;
    const points = parseInt(document.getElementById('teamPoints').value) || 0;

    db.collection("pointsTable").doc(teamId).set({
        w: wins,
        l: losses,
        pts: points,
        p: (wins + losses)
    })
    .then(() => alert("Points Table Cloud Par Save Ho Gaya!"))
    .catch(err => alert("Error: " + err.message));
}

function saveMatchSchedule() {
    const date = document.getElementById('matchDate').value;
    const teams = document.getElementById('matchTeams').value;
    const venue = document.getElementById('matchVenue').value;

    db.collection("schedule").doc("nextMatch").set({
        date: date,
        teams: teams,
        venue: venue
    })
    .then(() => alert("Match Schedule Live Update Ho Gaya!"))
    .catch(err => alert("Error: " + err.message));
}

function savePlayerStats() {
    db.collection("stats").doc("performers").set({
        bat_name: document.getElementById('topBatsmanName').value,
        bat_runs: document.getElementById('topBatsmanRuns').value,
        bowl_name: document.getElementById('topBowlerName').value,
        bowl_wkt: document.getElementById('topBowlerWickets').value
    })
    .then(() => alert("Player Stats Cloud Par Publish Ho Gaye!"))
    .catch(err => err => alert("Error: " + err.message));
}

function loadAdminCurrentData() {
    db.collection("stats").doc("performers").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('topBatsmanName').value = data.bat_name || "";
            document.getElementById('topBatsmanRuns').value = data.bat_runs || "";
            document.getElementById('topBowlerName').value = data.bowl_name || "";
            document.getElementById('topBowlerWickets').value = data.bowl_wkt || "";
        }
    });
}

// ==========================================
// CLOUD FILE UPLOAD & STORAGE LOGIC (PHOTOS)
// ==========================================

function uploadDirectImage() {
    const fileInput = document.getElementById('galleryFileInput');
    const file = fileInput.files[0];

    if (!file) { alert("Pehle koi tasveer select karein!"); return; }

    // Cloud Storage par unique naam se pic save karna
    const storageRef = storage.ref('gallery/' + Date.now() + '_' + file.name);
    
    alert("Photo upload ho rahi hai, baraye meharbani intazar karein...");

    storageRef.put(file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
            // URL ko Firestore database ke array me save karna
            db.collection("gallery").doc("images").set({
                urls: firebase.firestore.FieldValue.arrayUnion(downloadURL)
            }, { merge: true })
            .then(() => {
                fileInput.value = "";
                loadAdminGalleryPreview();
                alert("Tasveer Cloud Storage Par Kamyabi Se Upload Ho Gai!");
            });
        });
    }).catch(err => alert("Upload failed: " + err.message));
}

function removeGalleryImage(url) {
    if (confirm("Kya aap is tasveer ko delete karna chahte hain?")) {
        db.collection("gallery").doc("images").update({
            urls: firebase.firestore.FieldValue.arrayRemove(url)
        })
        .then(() => {
            loadAdminGalleryPreview();
            alert("Tasveer delete ho gai!");
        });
    }
}

function loadAdminGalleryPreview() {
    const previewContainer = document.getElementById('admin-gallery-preview');
    if (!previewContainer) return;
    previewContainer.innerHTML = "";

    db.collection("gallery").doc("images").get().then((doc) => {
        if (doc.exists && doc.data().urls) {
            doc.data().urls.forEach((url) => {
                const div = document.createElement('div');
                div.style.position = 'relative';
                div.style.cursor = 'pointer';
                div.innerHTML = `
                    <img src="${url}" style="width:80px; height:60px; object-fit:cover; border-radius:4px; border:2px solid rgba(255,255,255,0.1);">
                    <div style="position:absolute; top:-5px; right:-5px; background:#ef4444; color:white; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:10px;"><i class="fas fa-times"></i></div>
                `;
                div.onclick = () => removeGalleryImage(url);
                previewContainer.appendChild(div);
            });
        }
    });
}

// ==========================================
// DYNAMIC LIVE DATA LOAD FOR VISITORS (INDEX.HTML)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    
    // 1. Cloud se Live Points Table load karna
    db.collection("pointsTable").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let rowIndex = 0;
            if(doc.id === "team_1") rowIndex = 1;
            if(doc.id === "team_2") rowIndex = 2;

            const row = document.querySelectorAll('.points-table tbody tr')[rowIndex];
            if (row) {
                row.cells[2].innerText = data.p || 0;
                row.cells[3].innerText = data.w || 0;
                row.cells[4].innerText = data.l || 0;
                row.cells[5].innerText = data.pts || 0;
            }
        });
    });

    // 2. Cloud se Live Match Card load karna
    db.collection("schedule").doc("nextMatch").get().then((doc) => {
        const matchCard = document.querySelector('.match-card');
        if (matchCard && doc.exists) {
            const data = doc.data();
            matchCard.querySelector('.match-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.date}`;
            matchCard.querySelector('.teams').innerText = data.teams;
            matchCard.querySelector('.venue').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.venue}`;
        }
    });

    // 3. Cloud se Live Top Performers load karna
    db.collection("stats").doc("performers").get().then((doc) => {
        const statNames = document.querySelectorAll('.stat-name');
        const statValues = document.querySelectorAll('.stat-value');
        if (statNames.length > 0 && doc.exists) {
            const data = doc.data();
            statNames[0].innerText = data.bat_name;
            statValues[0].innerText = data.bat_runs;
            statNames[1].innerText = data.bowl_name;
            statValues[1].innerText = data.bowl_wkt;
        }
    });

    // 4. Cloud se Live Gallery Photos load karna
    const galleryGrid = document.getElementById('website-gallery-grid');
    if (galleryGrid) {
        db.collection("gallery").doc("images").get().then((doc) => {
            if (doc.exists && doc.data().urls) {
                galleryGrid.innerHTML = "";
                doc.data().urls.forEach(url => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.innerHTML = `<img src="${url}" alt="Match Pic">`;
                    galleryGrid.appendChild(item);
                });
            }
        });
    }
});

// ==========================================
// WHATSAPP FORM REGISTRATION
// ==========================================
const regForm = document.getElementById('registrationForm');
if (regForm) {
    regForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const teamName = document.getElementById('teamName').value;
        const captainName = document.getElementById('captainName').value;
        const contactNum = document.getElementById('contactNum').value;
        const playerList = document.getElementById('playerList').value;

        const whatsappMessage = `🏏 *NEW TEAM REGISTRATION* 🏏\n` +
                                `----------------------------------\n` +
                                `🏆 *Team Name:* ${teamName}\n` +
                                `👤 *Captain:* ${captainName}\n` +
                                `📞 *Contact:* ${contactNum}\n` +
                                `👥 *Players:* \n${playerList}\n` +
                                `----------------------------------`;

        const whatsappUrl = `https://wa.me/923024337352?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });
}
