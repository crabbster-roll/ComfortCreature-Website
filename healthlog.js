// healthlog.js (with Edit + Delete for entries)
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
    petLogs.slice().reverse().forEach((entry, indexReversed) => {
      // indexReversed is index in reversed array -> compute original index
      const idx = petLogs.length - 1 - indexReversed;
      const entryEl = document.createElement('div');
      entryEl.className = 'health-log-entry';
      entryEl.dataset.idx = idx;

      const meta = document.createElement('div');
      meta.className = 'entry-meta';
      meta.innerHTML = `<strong>${escapeHtml(entry.date)}</strong>`;

      const text = document.createElement('div');
      text.className = 'entry-text';
      text.textContent = entry.text;

      const controls = document.createElement('div');
      controls.className = 'entry-controls';
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Edit';
      btnEdit.addEventListener('click', function () {
        openEditEntryForm(petId, idx, entryEl, entry);
      });
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Delete';
      btnDelete.addEventListener('click', function () {
        if (!confirm('Delete this entry?')) return;
        deleteEntry(petId, idx);
      });
      controls.appendChild(btnEdit);
      controls.appendChild(btnDelete);

      entryEl.appendChild(meta);
      entryEl.appendChild(text);
      entryEl.appendChild(controls);
      list.appendChild(entryEl);
    });
  }

  function deleteEntry(petId, idx) {
    const logs = loadLogs();
    if (!Array.isArray(logs[petId])) return;
    logs[petId].splice(idx, 1);
    saveLogs(logs);
    renderLogsForPet(petId);
  }

  function openEditEntryForm(petId, idx, entryEl, entry) {
    // if already editing, bail
    if (entryEl.querySelector('.edit-entry-form')) return;

    const form = document.createElement('form');
    form.className = 'edit-entry-form';

    // create inputs prefilled
    form.innerHTML = `
      <label>Date <input type="date" name="date" value="${escapeHtml(entry.date)}" required></label>
      <label>Note <textarea name="text" required>${escapeHtml(entry.text)}</textarea></label>
      <div class="edit-entry-buttons"><button type="submit">Save</button> <button type="button" class="cancel-edit-entry">Cancel</button></div>
    `;

    const originalText = entryEl.querySelector('.entry-text');
    originalText.style.display = 'none';
    entryEl.appendChild(form);

    form.querySelector('.cancel-edit-entry').addEventListener('click', function () {
      form.remove();
      originalText.style.display = '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      const newDate = fd.get('date');
      const newText = fd.get('text').trim();
      if (!newDate || !newText) {
        alert('Please provide a date and note.');
        return;
      }
      const logs = loadLogs();
      if (!Array.isArray(logs[petId])) logs[petId] = [];
      // update the entry in place
      logs[petId][idx] = { date: newDate, text: newText };
      saveLogs(logs);
      renderLogsForPet(petId);
    });
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
      const logs = loadLogs();
      if (!Array.isArray(logs[petId])) logs[petId] = [];
      logs[petId].push({ date, text });
      saveLogs(logs);
      form.reset();
      renderLogsForPet(petId);
    });
  });

  // loadPets helper used above
  function loadPets() {
    try {
      return JSON.parse(localStorage.getItem(PETS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }
})();
