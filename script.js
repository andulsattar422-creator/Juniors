// ==========================================
// FIREBASE INITIALIZATION
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
        document.body.classList.toggle('dark-theme');
    });
}

// ==========================================
// ADMIN FUNCTIONS (Jahan se control hota hai)
// ==========================================
function checkAdminPassword() {
    if (document.getElementById('adminPassword').value === 'JuniorTeam') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminCurrentData();
        loadAdminGalleryPreview();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function savePointsTable() {
    const teamId = document.getElementById('updateTeamSelect').value;
    db.collection("pointsTable").doc(teamId).set({
        w: parseInt(document.getElementById('teamWins').value) || 0,
        l: parseInt(document.getElementById('teamLosses').value) || 0,
        pts: parseInt(document.getElementById('teamPoints').value) || 0,
        p: (parseInt(document.getElementById('teamWins').value) || 0) + (parseInt(document.getElementById('teamLosses').value) || 0)
    }).then(() => alert("Points Table Live Update Ho Gaya!"));
}

function saveMatchSchedule() {
    db.collection("schedule").doc("nextMatch").set({
        date: document.getElementById('matchDate').value,
        teams: document.getElementById('matchTeams').value,
        venue: document.getElementById('matchVenue').value
    }).then(() => alert("Match Fixture Live Update Ho Gaya!"));
}

function savePlayerStats() {
    db.collection("stats").doc("performers").set({
        bat_name: document.getElementById('topBatsmanName').value,
        bat_runs: document.getElementById('topBatsmanRuns').value,
        bowl_name: document.getElementById('topBowlerName').value,
        bowl_wkt: document.getElementById('topBowlerWickets').value
    }).then(() => alert("Stats Live Update Ho Gaye!"));
}

function uploadDirectImage() {
    const file = document.getElementById('galleryFileInput').files[0];
    if (!file) return alert("Pehle photo select karein!");
    const storageRef = storage.ref('gallery/' + Date.now() + '_' + file.name);
    
    storageRef.put(file).then(snapshot => {
        snapshot.ref.getDownloadURL().then(url => {
            db.collection("gallery").doc("images").set({
                urls: firebase.firestore.FieldValue.arrayUnion(url)
            }, { merge: true }).then(() => {
                document.getElementById('galleryFileInput').value = "";
                loadAdminGalleryPreview();
                alert("Photo Live Website Par Chali Gai!");
            });
        });
    });
}

function loadAdminGalleryPreview() {
    const container = document.getElementById('admin-gallery-preview');
    if (!container) return; container.innerHTML = "";
    db.collection("gallery").doc("images").get().then(doc => {
        if (doc.exists && doc.data().urls) {
            doc.data().urls.forEach(url => {
                const div = document.createElement('div');
                div.innerHTML = `<img src="${url}" style="width:70px; height:55px; object-fit:cover; border-radius:4px;">`;
                div.onclick = () => {
                    if(confirm("Delete karein?")) {
                        db.collection("gallery").doc("images").update({ urls: firebase.firestore.FieldValue.arrayRemove(url) }).then(() => loadAdminGalleryPreview());
                    }
                };
                container.appendChild(div);
            });
        }
    });
}

// ==========================================
// DYNAMIC LIVE DATA LOAD FOR VISITORS (INDEX.HTML)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Points Table Load Karna
    db.collection("pointsTable").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let index = doc.id === "team_0" ? 0 : (doc.id === "team_1" ? 1 : 2);
            const row = document.querySelectorAll('.points-table tbody tr')[index];
            if (row) {
                row.cells[2].innerText = data.p || 0;
                row.cells[3].innerText = data.w || 0;
                row.cells[4].innerText = data.l || 0;
                row.cells[5].innerText = data.pts || 0;
            }
        });
    });

    // 2. Next Match Details Load Karna
    db.collection("schedule").doc("nextMatch").get().then((doc) => {
        const card = document.querySelector('.match-card');
        if (card && doc.exists) {
            const data = doc.data();
            card.querySelector('.match-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${data.date}`;
            card.querySelector('.teams').innerText = data.teams;
            card.querySelector('.venue').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.venue}`;
        }
    });

    // 3. Stats Load Karna
    db.collection("stats").doc("performers").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            const names = document.querySelectorAll('.stat-name');
            const values = document.querySelectorAll('.stat-value');
            if(names[0]) { names[0].innerText = data.bat_name; values[0].innerText = data.bat_runs + " Runs"; }
            if(names[1]) { names[1].innerText = data.bowl_name; values[1].innerText = data.bowl_wkt + " Wkts"; }
        }
    });

    // 4. Gallery Images Load Karna
    const grid = document.getElementById('website-gallery-grid');
    if (grid) {
        grid.innerHTML = "";
        db.collection("gallery").doc("images").get().then((doc) => {
            if (doc.exists && doc.data().urls) {
                doc.data().urls.forEach(url => {
                    const div = document.createElement('div');
                    div.style.borderRadius = "8px";
                    div.style.overflow = "hidden";
                    div.innerHTML = `<img src="${url}" style="width:100%; height:120px; object-fit:cover; display:block;">`;
                    grid.appendChild(div);
                });
            }
        });
    }
});
