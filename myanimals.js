// myanimals.js
(function () {
  const PETS_KEY = 'cc_pets_v1';

  // Default seed data (used only if no pets in localStorage)
  const defaultPets = [
    {
      id: 'pet-' + Date.now() + '-1',
      name: 'Lincoln',
      species: 'Dog',
      dob: '',
      diet: 'Kibble every AM and PM',
      notes: 'Favors females over males, tends to have allergies in the spring.',
      photo: 'dogmyanimals.jpg'
    },
    {
      id: 'pet-' + Date.now() + '-2',
      name: 'Charlie',
      species: 'Cat',
      dob: '',
      diet: 'Dry Food & Wet Food everyday',
      notes: 'Takes lots of naps.',
      photo: 'catmyanimals.jpg'
    },
    {
      id: 'pet-' + Date.now() + '-3',
      name: 'Goldie',
      species: 'Fish',
      dob: '',
      diet: 'Fish food once in the AM',
      notes: 'Very easy to take care of.',
      photo: 'fishmyanimals.jpg'
    }
  ];

  function loadPets() {
    try {
      const raw = localStorage.getItem(PETS_KEY);
      if (!raw) {
        // seed defaults (do not overwrite if later)
        localStorage.setItem(PETS_KEY, JSON.stringify(defaultPets));
        return defaultPets.slice();
      }
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load pets from storage', e);
      return defaultPets.slice();
    }
  }

  function savePets(pets) {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets));
  }

  function makePetCard(pet) {
    const wrapper = document.createElement('div');
    wrapper.className = 'pet-card';
    // image
    const img = document.createElement('img');
    img.alt = pet.name + ' photo';
    img.src = pet.photo || 'logo.png';

    const info = document.createElement('div');
    info.className = 'pet-info';
    info.innerHTML = `<strong>${escapeHtml(pet.name)}</strong><br>
      <b>Species:</b> ${escapeHtml(pet.species)}<br>
      ${pet.dob ? `<b>DOB:</b> ${escapeHtml(pet.dob)}<br>` : ''}
      <b>Diet:</b> ${escapeHtml(pet.diet || '')}<br>
      <b>Notes:</b> ${escapeHtml(pet.notes || '')}`;

    const btn = document.createElement('button');
    btn.className = 'health-log-btn';
    btn.textContent = 'Health Log';
    btn.addEventListener('click', function () {
      // navigate to health log page with pet id in query string
      window.location.href = `healthlog.html?petId=${encodeURIComponent(pet.id)}`;
    });

    wrapper.appendChild(img);
    wrapper.appendChild(info);
    wrapper.appendChild(btn);
    return wrapper;
  }

  function renderPetList() {
    const listEl = document.querySelector('.pet-list');
    if (!listEl) return;
    listEl.innerHTML = ''; // clear
    const pets = loadPets();
    if (!pets || pets.length === 0) {
      listEl.innerHTML = '<p>No pets yet — add one on the right.</p>';
      return;
    }
    pets.forEach((p) => {
      listEl.appendChild(makePetCard(p));
    });
  }

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
      photo: '' // will set below
    };

    // if user provided a photo file, convert to data URL
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        newPet.photo = ev.target.result; // base64 data URL
        addPetToStorage(newPet);
      };
      reader.onerror = function () {
        alert('Could not read photo file - pet saved without photo.');
        addPetToStorage(newPet);
      };
      reader.readAsDataURL(photoFile);
    } else {
      // no file chosen — use a small placeholder image or leave blank
      newPet.photo = 'logo.png';
      addPetToStorage(newPet);
    }

    // reset form
    e.target.reset();
  }

  function addPetToStorage(pet) {
    const pets = loadPets();
    pets.push(pet);
    savePets(pets);
    renderPetList();
  }

  // utility to avoid XSS when writing user input
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // init
  document.addEventListener('DOMContentLoaded', function () {
    renderPetList();
    const form = document.getElementById('add-pet-form');
    if (form) form.addEventListener('submit', handleFormSubmit);
  });
})();
