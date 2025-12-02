// survey.js
(function () {
  const SURVEY_KEY = 'cc_survey_v1';
  const FEEDBACK_KEY = 'cc_feedback_v1';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // Multi-step navigation
  const steps = $all('.survey-step');
  let currentStep = 0;
  const prevBtn = $('#prev-btn');
  const nextBtn = $('#next-btn');
  const submitBtn = $('#submit-btn');
  const surveyStatus = $('#survey-status');
  const form = $('#survey-form');

  function showStep(idx) {
    steps.forEach((s, i) => s.classList.toggle('active', i === idx));
    currentStep = idx;
    prevBtn.disabled = idx === 0;
    nextBtn.style.display = (idx === steps.length - 1) ? 'none' : '';
    submitBtn.style.display = (idx === steps.length - 1) ? '' : 'none';
    surveyStatus.textContent = `Question ${idx + 1} of ${steps.length}`;
  }

  // Rating stars
  const stars = $all('#rating-stars .star');
  const satisfactionInput = $('#satisfaction');

  function setRating(value) {
    stars.forEach(s => s.classList.toggle('selected', Number(s.dataset.value) <= Number(value)));
    satisfactionInput.value = value;
  }

  stars.forEach(s => {
    s.addEventListener('click', () => {
      setRating(s.dataset.value);
    });
    s.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setRating(s.dataset.value);
      }
    });
  });

  // Next / Prev handlers
  nextBtn.addEventListener('click', () => {
    // simple validation: for step 1 ensure rating selected
    if (currentStep === 0 && !satisfactionInput.value) {
      alert('Please pick a satisfaction rating to continue.');
      return;
    }
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  // Save survey to localStorage
  function loadSurveys() {
    try { return JSON.parse(localStorage.getItem(SURVEY_KEY) || '[]'); } catch(e) { return []; }
  }
  function saveSurveys(arr) {
    try { localStorage.setItem(SURVEY_KEY, JSON.stringify(arr)); } catch(e) { console.error(e); }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // collect values
    const satisfaction = satisfactionInput.value || '';
    const favorite = form.elements['favorite'] && form.elements['favorite'].value ? form.elements['favorite'].value : '';
    const suggestions = $('#suggestions').value.trim();
    // minimal validation
    if (!satisfaction) { alert('Please select a satisfaction rating.'); return; }
    // store
    const store = loadSurveys();
    store.push({
      id: 's_' + Date.now(),
      date: new Date().toISOString(),
      satisfaction,
      favorite,
      suggestions
    });
    saveSurveys(store);
    // friendly confirmation
    surveyStatus.textContent = 'Thanks — your response was recorded locally.';
    // reset to first step / clear inputs
    form.reset();
    setRating(0);
    showStep(0);
  });

  // COMMUNITY FEEDBACK modal behavior + storage
  const openFeedback = $('#open-feedback');
  const modal = $('#feedback-modal');
  const closeFeedback = $('#close-feedback');
  const cancelFeedback = $('#cancel-feedback');
  const feedbackForm = $('#feedback-form');
  const feedbackPreview = $('#feedback-preview');

  function openModal() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    $('#fb-text').focus();
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  openFeedback.addEventListener('click', openModal);
  closeFeedback.addEventListener('click', closeModal);
  cancelFeedback.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  function loadFeedback() {
    try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]'); } catch(e){ return []; }
  }
  function saveFeedback(arr) {
    try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(arr)); } catch(e){ console.error(e); }
  }

  function renderFeedback() {
    const items = loadFeedback();
    feedbackPreview.innerHTML = '';
    if (!items.length) {
      feedbackPreview.innerHTML = '<p class="small-muted">No community messages yet — be the first to post!</p>';
      return;
    }
    items.slice().reverse().forEach(it => {
      const node = document.createElement('div');
      node.className = 'feedback-item';
      const who = it.name ? `<strong>${escapeHtml(it.name)}</strong> • ` : '';
      node.innerHTML = `${who}<span class="small-muted" style="font-size:0.9rem">${new Date(it.date).toLocaleString()}</span><div>${escapeHtml(it.text)}</div>`;
      feedbackPreview.appendChild(node);
    });
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  feedbackForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = $('#fb-name').value.trim();
    const text = $('#fb-text').value.trim();
    if (!text) { alert('Please enter a message.'); return; }
    const all = loadFeedback();
    all.push({ id: 'f_' + Date.now(), name: name || '', text, date: new Date().toISOString() });
    saveFeedback(all);
    renderFeedback();
    feedbackForm.reset();
    closeModal();
  });

  // Initialize page
  document.addEventListener('DOMContentLoaded', function () {
    showStep(0);
    renderFeedback();
  });

})();
