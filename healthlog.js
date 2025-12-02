// healthlog.js
(function () {
  const PETS_KEY = 'cc_pets_v1';
  const LOGS_KEY = 'cc_healthlogs_v1';

  function qs(key) {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  }

  function loadPets() {
    try {
      return JSON.parse(localStorage.getItem(PETS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function loadLogs() {
    try {
      return JSON.parse(localStorage.getItem(LOGS_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveLogs(obj) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(obj));
  }

  function renderPet(pet) {
    const container = document.getElementById('pet-details');
    if (!container) return;
    container.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'pet-card';
    const img = document.createElement('img');
    img.src = pet.photo || 'logo.png';
    img.alt = pet.name + ' photo';
    const info = document.createElement('div');
    info.className = 'pet-info';
    info.innerHTML = `<strong>${escapeHtml(pet.name)}</strong><br>
      <b>Species:</b> ${escapeHtml(pet.species)}<br>
      ${pet.dob ? `<b>DOB:</b> ${escapeHtml(pet.dob)}<br>` : ''}
      <b>Diet:</b> ${escapeHtml(pet.diet || '')}<br>
      <b>Notes:</b> ${escapeHtml(pet.notes || '')}`;
    card.appendChild(img);
    card.appendChild(info);
    container.appendChild(card);
  }

  function renderLogsForPet(petId) {
    const list = document.getElementById('log-list');
    list.innerHTML = '';
    const logs = loadLogs();
    const petLogs = logs[petId] || [];
    if (petLogs.length === 0) {
      list.innerHTML = '<p>No entries yet.</p>';
      return;
    }
    // newest first
    petLogs.slice().reverse().forEach(entry => {
      const el = document.createElement('div');
      el.className = 'health-log-entry';
      el.innerHTML = `<div class="entry-meta"><strong>${escapeHtml(entry.date)}</strong> • <em>${escapeHtml(entry.title || '')}</em></div>
                      <div class="entry-text">${escapeHtml(entry.text)}</div>`;
      list.appendChild(el);
    });
  }

  function addLogForPet(petId, entry) {
    const logs = loadLogs();
    if (!logs[petId]) logs[petId] = [];
    logs[petId].push(entry);
    saveLogs(logs);
    renderLogsForPet(petId);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    const petId = qs('petId');
    if (!petId) {
      document.getElementById('pet-title').textContent = 'Health Log — no pet selected';
      return;
    }
    const pets = loadPets();
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      document.getElementById('pet-title').textContent = 'Pet not found';
      return;
    }
    document.getElementById('pet-title').textContent = `Health Log — ${pet.name}`;
    renderPet(pet);
    renderLogsForPet(petId);

    const form = document.getElementById('add-log-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const date = document.getElementById('log-date').value;
      const text = document.getElementById('log-text').value.trim();
      if (!date || !text) {
        alert('Please add a date and a note.');
        return;
      }
      const entry = { date, text, title: '' };
      addLogForPet(petId, entry);
      form.reset();
    });
  });
})();
