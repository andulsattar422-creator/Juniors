// ==========================================
// THEME TOGGLE FUNCTIONALITY
// ==========================================
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
}

// ==========================================
// ADMIN PANEL LOGIN & CONTROLS LOGIC
// ==========================================

// SECURE PASSWORD SET TO: JuniorTeam
function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('login-error');
    
    if (passwordInput === 'JuniorTeam') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        loadAdminCurrentData();
    } else {
        errorMsg.style.display = 'block';
    }
}

function savePointsTable() {
    const teamIndex = document.getElementById('updateTeamSelect').value;
    const wins = document.getElementById('teamWins').value || "0";
    const losses = document.getElementById('teamLosses').value || "0";
    const points = document.getElementById('teamPoints').value || "0";

    localStorage.setItem(`team_${teamIndex}_w`, wins);
    localStorage.setItem(`team_${teamIndex}_l`, losses);
    localStorage.setItem(`team_${teamIndex}_pts`, points);

    alert("Points Table Updated Successfully!");
}

function saveMatchSchedule() {
    const date = document.getElementById('matchDate').value;
    const teams = document.getElementById('matchTeams').value;
    const venue = document.getElementById('matchVenue').value;

    if(date) localStorage.setItem('m_date', date);
    if(teams) localStorage.setItem('m_teams', teams);
    if(venue) localStorage.setItem('m_venue', venue);

    alert("Match Schedule Updated!");
}

function savePlayerStats() {
    localStorage.setItem('bat_name', document.getElementById('topBatsmanName').value);
    localStorage.setItem('bat_runs', document.getElementById('topBatsmanRuns').value);
    localStorage.setItem('bowl_name', document.getElementById('topBowlerName').value);
    localStorage.setItem('bowl_wkt', document.getElementById('topBowlerWickets').value);

    alert("Player Statistics Updated!");
}

function loadAdminCurrentData() {
    if(document.getElementById('matchDate')) {
        document.getElementById('topBatsmanName').value = localStorage.getItem('bat_name') || "Ali Ahmed";
        document.getElementById('topBatsmanRuns').value = localStorage.getItem('bat_runs') || "120 Runs";
        document.getElementById('topBowlerName').value = localStorage.getItem('bowl_name') || "Zain Khan";
        document.getElementById('topBowlerWickets').value = localStorage.getItem('bowl_wkt') || "5 Wickets";
    }
}

// ==========================================
// DYNAMIC DATA POPULATION ON LIVE WEBSITE
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Live Points Table Render
    for (let i = 0; i < 3; i++) {
        const row = document.querySelectorAll('.points-table tbody tr')[i];
        if (row) {
            const w = localStorage.getItem(`team_${i}_w`);
            const l = localStorage.getItem(`team_${i}_l`);
            const pts = localStorage.getItem(`team_${i}_pts`);
            if (w !== null) row.cells[2].innerText = w;
            if (l !== null) row.cells[3].innerText = l;
            // Total matches played calculator (Wins + Losses)
            if (w !== null && l !== null) {
                row.cells[1].innerText = parseInt(w) + parseInt(l);
            }
            if (pts !== null) row.cells[5].innerText = pts;
        }
    }

    // 2. Live Schedule Card Render
    const matchCard = document.querySelector('.match-card');
    if (matchCard && localStorage.getItem('m_date')) {
        matchCard.querySelector('.match-date').innerHTML = `<i class="fas fa-calendar-alt"></i> ${localStorage.getItem('m_date')}`;
        matchCard.querySelector('.teams').innerText = localStorage.getItem('m_teams');
        matchCard.querySelector('.venue').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${localStorage.getItem('m_venue')}`;
    }

    // 3. Live Stats Highlight Render
    const statNames = document.querySelectorAll('.stat-name');
    const statValues = document.querySelectorAll('.stat-value');
    if (statNames.length > 0 && localStorage.getItem('bat_name')) {
        statNames[0].innerText = localStorage.getItem('bat_name');
        statValues[0].innerText = localStorage.getItem('bat_runs');
        statNames[1].innerText = localStorage.getItem('bowl_name');
        statValues[1].innerText = localStorage.getItem('bowl_wkt');
    }
});

// ==========================================
// WHATSAPP AUTOMATIC REGISTRATION FORMATTING
// ==========================================
const regForm = document.getElementById('registrationForm');
if(regForm) {
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
