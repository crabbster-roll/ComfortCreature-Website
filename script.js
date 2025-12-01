// script.js - combined: share buttons, registration form validation, paw-facts UI
document.addEventListener("DOMContentLoaded", function () {
  /* -------------------------
     Share buttons (Facebook / Twitter)
     ------------------------- */
  (function setupShareButtons() {
    const urlToShare = 'https://crabbster-roll.github.io/ComfortCreature-Website/';
    const shareFacebookButton = document.getElementById("share-facebook");
    const shareTwitterButton = document.getElementById("share-twitter");

    function openPopup(url, title) {
      try {
        window.open(url, title, 'width=600,height=400');
      } catch (e) {
        // fallback: navigate (rare)
        window.location.href = url;
      }
    }

    if (shareFacebookButton) {
      shareFacebookButton.addEventListener("click", function () {
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlToShare)}`;
        openPopup(facebookShareUrl, 'Share on Facebook');
      });
    }

    if (shareTwitterButton) {
      shareTwitterButton.addEventListener("click", function () {
        const textToShare = 'Check out Creature Comfort!';
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(urlToShare)}&text=${encodeURIComponent(textToShare)}`;
        openPopup(twitterShareUrl, 'Share on X (Twitter)');
      });
    }
  })();


  /* -------------------------
     Registration form validation (graceful, accumulates errors)
     ------------------------- */
  (function setupFormValidation() {
    const form = document.getElementById("registration-form");
    if (!form) return; // nothing to do

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    form.addEventListener("submit", function (event) {
      const errors = [];

      // Username
      if (!usernameInput || usernameInput.value.trim().length < 3) {
        errors.push("Username must be at least 3 characters long.");
      }

      // Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
        errors.push("Please enter a valid email address.");
      }

      // Password length
      if (!passwordInput || passwordInput.value.length < 6) {
        errors.push("Password must be at least 6 characters long.");
      }

      // Password match
      if (!confirmPasswordInput || passwordInput.value !== confirmPasswordInput.value) {
        errors.push("Passwords do not match.");
      }

      if (errors.length > 0) {
        event.preventDefault();
        // Replace alert with nicer UI later; using alert for now to keep it simple
        alert(errors.join("\n"));
      }
    });
  })();


  /* -------------------------
     Paw-facts UI (left + right paw open same dialog)
     ------------------------- */
  (function pawFactsUI() {
    const pawLeft = document.getElementById('pawLeft');
    const pawRight = document.getElementById('pawRight');
    const pawDialog = document.getElementById('pawDialog');
    const pawFact = document.getElementById('pawDialogFact');
    const pawLive = document.getElementById('pawLive');
    const pawClose = document.getElementById('pawClose');
    const pawNewFact = document.getElementById('pawNewFact');

    if (!pawDialog || !pawFact || !pawNewFact || !pawClose) {
      // Required elements missing — bail quietly
      return;
    }

    // Facts array - edit/add as you like
    const facts = [
      "Octopuses have three hearts — two pump blood to the gills and one pumps blood to the rest of the body.",
      "A dog's nose print is unique — just like a human fingerprint.",
      "Male bettas build bubble nests to care for their fry after spawning.",
      "Cats have unique nose patterns similar to human fingerprints.",
      "Sea turtles can sleep underwater for several hours by slowing their metabolism.",
      "Many parrots can mimic human speech because of their highly developed vocal organ called the syrinx.",
      "Guinea pigs prefer moderate climates and don't tolerate sudden temperature changes well."
    ];

    function randomFact() {
      return facts[Math.floor(Math.random() * facts.length)];
    }

    // Focusable elements inside dialog for basic trap
    function getDialogFocusables() {
      return Array.from(pawDialog.querySelectorAll('button, [href], input, textarea, select'))
        .filter(el => !el.hasAttribute('disabled'));
    }

    // Open/close handlers
    function openDialog(triggeringElement) {
      // Save last focused element BEFORE moving focus
      pawDialog._lastFocus = triggeringElement || document.activeElement;

      const fact = randomFact();
      pawFact.textContent = fact;
      pawDialog.setAttribute('aria-hidden', 'false');
      pawLive.textContent = "New fun fact: " + fact; // announce to screen readers

      // Move focus into dialog (to "Another Fact" button for convenience)
      pawNewFact.focus();

      // attach key handler for Esc and Tab focus trap
      document.addEventListener('keydown', onDialogKeyDown);
    }

    function closeDialog() {
      pawDialog.setAttribute('aria-hidden', 'true');
      pawLive.textContent = "";
      document.removeEventListener('keydown', onDialogKeyDown);

      // Restore focus to the element that opened the dialog (if possible)
      if (pawDialog._lastFocus && typeof pawDialog._lastFocus.focus === 'function') {
        pawDialog._lastFocus.focus();
      }
    }

    function onDialogKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (e.key === 'Tab') {
        // Basic focus trap so keyboard users stay inside dialog
        const focusables = getDialogFocusables();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    // Attach click / keyboard handlers to paw buttons (if present)
    [pawLeft, pawRight].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', function () {
        openDialog(btn);
      });
      // allow Enter / Space on keyboard to activate
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDialog(btn);
        }
      });
    });

    // Dialog action buttons
    pawNewFact.addEventListener('click', function () {
      const fact = randomFact();
      pawFact.textContent = fact;
      pawLive.textContent = "New fun fact: " + fact;
      // keep focus on the "Another Fact" button
      pawNewFact.focus();
    });

    pawClose.addEventListener('click', function () {
      closeDialog();
    });

    // clicking overlay outside the card closes the dialog
    pawDialog.addEventListener('click', function (e) {
      if (e.target === pawDialog) {
        closeDialog();
      }
    });

    // initialize hidden state
    pawDialog.setAttribute('aria-hidden', 'true');
  })();

}); // DOMContentLoaded
