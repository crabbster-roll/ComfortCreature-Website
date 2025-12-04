// myanimals.js (fixed)
(function () {
  const PETS_KEY = 'cc_pets_v1';
  const LOGS_KEY = 'cc_healthlogs_v1';

  const defaultPets = [
    {
      id: 'pet-' + Date.now() + '-1',
      name: 'Lincoln',
      species: 'Dog',
      dob: '',
      diet: 'Kibble every AM and PM',
      notes: 'Favors females over males, tends to have allergies in the spring.',
      photo: 'MyAnimalsImages/dogmyanimals.jpg'
    },
    {
      id: 'pet-' + Date.now() + '-2',
      name: 'Charlie',
      species: 'Cat',
      dob: '',
      diet: 'Dry Food & Wet Food everyday',
      notes: 'Takes lots of naps.',
      photo: 'MyAnimalsImages/catmyanimals.jpg'
    },
    {
      id: 'pet-' + Date.now() + '-3',
      name: 'Goldie',
      species: 'Fish',
      dob: '',
      diet: 'Fish food once in the AM',
      notes: 'Very easy to take care of.',
      photo: 'MyAnimalsImages/fishmyanimals.jpg'
    }
  ];

  // migration helper
  function migratePetsIfNeeded(pets) {
    let changed = false;
    const fixed = pets.map(p => {
      if (!p || !p.photo) return p;
      // leave data-URLs, external urls, or already-pathed values alone
      if (typeof p.photo !== 'string') return p;
      if (p.photo.startsWith('data:') || p.photo.startsWith('http') || p.photo.indexOf('/') !== -1) return p;
      if (p.photo === 'logo.png') return p;
      changed = true;
      return { ...p, photo: 'MyAnimalsImages/' + p.photo };
    });
    return changed ? fixed : pets;
  }

  // loadPets WITH migration (keep this; remove any duplicate definitions)
  function loadPets() {
    try {
      const raw = localStorage.getItem(PETS_KEY);
      if (!raw) {
        localStorage.setItem(PETS_KEY, JSON.stringify(defaultPets));
        return defaultPets.slice();
      }
      const stored = JSON.parse(raw);
      const migrated = migratePetsIfNeeded(stored);
      if (migrated !== stored) {
        localStorage.setItem(PETS_KEY, JSON.stringify(migrated));
      }
      return migrated;
    } catch (e) {
      console.error('Failed to load pets from storage', e);
      return defaultPets.slice();
    }
  }

  function savePets(pets) {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets));
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

  // Utility to avoid XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // small helper: resolve photo sources (data URLs, absolute/relative paths, or bare filenames)
  function resolvePhotoSrc(photo) {
    if (!photo) return 'logo.png';
    if (typeof photo !== 'string') return 'logo.png';
    if (photo.startsWith('data:') || photo.startsWith('http') || photo.indexOf('/') !== -1) return photo;
    // bare filename -> assume MyAnimalsImages folder
    return 'MyAnimalsImages/' + photo;
  }

  function makePetCard(pet) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pet-card';
    wrapper.dataset.petId = pet.id;

    // image
    const img = document.createElement('img');
    img.alt = pet.name + ' photo';
    img.src = resolvePhotoSrc(pet.photo || 'logo.png');

    const info = document.createElement('div');
    info.className = 'pet-info';
    info.innerHTML = `<strong>${escapeHtml(pet.name)}</strong><br>
      <b>Species:</b> ${escapeHtml(pet.species)}<br>
      ${pet.dob ? `<b>DOB:</b> ${escapeHtml(pet.dob)}<br>` : ''}
      <b>Diet:</b> ${escapeHtml(pet.diet || '')}<br>
      <b>Notes:</b> ${escapeHtml(pet.notes || '')}`;

    const btnHealth = document.createElement('button');
    btnHealth.className = 'health-log-btn';
    btnHealth.textContent = 'Health Log';
    btnHealth.addEventListener('click', function () {
      window.location.href = `healthlog.html?petId=${encodeURIComponent(pet.id)}`;
    });

    const btnEdit = document.createElement('button');
    btnEdit.className = 'edit-pet-btn';
    btnEdit.textContent = 'Edit';
    btnEdit.addEventListener('click', function () {
      openEditForm(wrapper, pet);
    });

    const btnDelete = document.createElement('button');
    btnDelete.className = 'delete-pet-btn';
    btnDelete.textContent = 'Delete';
    btnDelete.addEventListener('click', function () {
      if (!confirm(`Delete ${pet.name}? This will remove the pet and its health logs.`)) return;
      deletePet(pet.id);
    });

    const controls = document.createElement('div');
    controls.className = 'pet-controls';
    controls.appendChild(btnHealth);
    controls.appendChild(btnEdit);
    controls.appendChild(btnDelete);

    wrapper.appendChild(img);
    wrapper.appendChild(info);
    wrapper.appendChild(controls);
    return wrapper;
  }

  function renderPetList() {
    const listEl = document.querySelector('.pet-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    const pets = loadPets();
    if (!pets || pets.length === 0) {
      listEl.innerHTML = '<p>No pets yet — add one on the right.</p>';
      return;
    }
    pets.forEach((p) => {
      listEl.appendChild(makePetCard(p));
    });
  }

  // Delete pet + remove logs
  function deletePet(petId) {
    let pets = loadPets();
    pets = pets.filter(p => p.id !== petId);
    savePets(pets);

    // remove logs for this pet
    const logs = loadLogs();
    if (logs[petId]) {
      delete logs[petId];
      saveLogs(logs);
    }
    renderPetList();
  }

  // Edit form inline on the card
  function openEditForm(cardEl, pet) {
    // if already editing, ignore
    if (cardEl.querySelector('.edit-pet-form')) return;

    const form = document.createElement('form');
    form.className = 'edit-pet-form';

    form.innerHTML = `
      <label>Name <input name="name" value="${escapeHtml(pet.name)}" required></label>
      <label>Species <input name="species" value="${escapeHtml(pet.species)}" required></label>
      <label>DOB <input type="date" name="dob" value="${escapeHtml(pet.dob)}"></label>
      <label>Diet <input name="diet" value="${escapeHtml(pet.diet || '')}"></label>
      <label>Notes <textarea name="notes">${escapeHtml(pet.notes || '')}</textarea></label>
      <label>Photo (choose new to replace) <input type="file" name="photo" accept="image/*"></label>
      <div class="edit-buttons"><button type="submit">Save</button> <button type="button" class="cancel-edit">Cancel</button></div>
    `;

    // hide static info while editing
    const infoDiv = cardEl.querySelector('.pet-info');
    infoDiv.style.display = 'none';
    const controls = cardEl.querySelector('.pet-controls');
    controls.style.display = 'none';

    cardEl.appendChild(form);

    form.querySelector('.cancel-edit').addEventListener('click', function () {
      form.remove();
      infoDiv.style.display = '';
      controls.style.display = '';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fd = new FormData(form);
      const updated = {
        ...pet,
        name: fd.get('name').trim(),
        species: fd.get('species').trim(),
        dob: fd.get('dob') || '',
        diet: fd.get('diet').trim(),
        notes: fd.get('notes').trim()
      };

      const photoFile = fd.get('photo');
      // check if a file was selected (FileList/Blob in modern browsers)
      if (photoFile && photoFile.size && photoFile.type) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          updated.photo = ev.target.result;
          commitPetUpdate(updated, cardEl, form, infoDiv, controls);
        };
        reader.onerror = function () {
          alert('Could not read photo file. Saving without new photo.');
          commitPetUpdate(updated, cardEl, form, infoDiv, controls);
        };
        reader.readAsDataURL(photoFile);
      } else {
        commitPetUpdate(updated, cardEl, form, infoDiv, controls);
      }
    });
  }

  // single commitPetUpdate function (no duplicates)
  function commitPetUpdate(updatedPet, cardEl, formEl, infoDiv, controls) {
    const pets = loadPets();
    const idx = pets.findIndex(p => p.id === updatedPet.id);
    if (idx >= 0) {
      pets[idx] = updatedPet;
      savePets(pets);
    }
    renderPetList();
  }

  // handle add form
  function handleFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('petname').value.trim();
    const species = document.getElementById('species').value.trim();
    const dob = document.getElementById('dob').value;
    const diet = document.getElementById('diet').value.trim();
    const notes = document.getElementById('notes').value.trim();
    const photoFile = document.getElementById('photo').files[0];

    if (!name || !species) {
      alert('Please enter at least a pet name and species.');
      return;
    }

    const newPet = {
      id: 'pet-' + Date.now(),
      name,
      species,
      dob,
      diet,
      notes,
      photo: ''
    };

    if (photoFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        newPet.photo = ev.target.result;
        addPetToStorage(newPet);
      };
      reader.onerror = function () {
        alert('Could not read photo file - pet saved without photo.');
        addPetToStorage(newPet);
      };
      reader.readAsDataURL(photoFile);
    } else {
      newPet.photo = 'logo.png';
      addPetToStorage(newPet);
    }

    e.target.reset();
  }

  function addPetToStorage(pet) {
    const pets = loadPets();
    pets.push(pet);
    savePets(pets);
    renderPetList();
  }

  // init
  document.addEventListener('DOMContentLoaded', function () {
    renderPetList();
    const form = document.getElementById('add-pet-form');
    if (form) form.addEventListener('submit', handleFormSubmit);
  });
})();
