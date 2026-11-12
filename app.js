/**
 * Pravah International — Hardened Client Application Logic (ES6)
 * Zero eval(), zero inline HTML injection, strict input sanitization.
 */

"use strict";

const N8N_WEBHOOK_URL = "https://dhruvilworkflow.app.n8n.cloud/webhook/pravah-pilot-intake";

(function () {
  const COOKIE_STORAGE_KEY = "pravah_cookie_consent_v1";

  /* ------------------------------------------------------------------------
     1. Utility: Sanitization & Smooth Focus Scroll
     ------------------------------------------------------------------------ */
  function sanitizeText(value) {
    if (typeof value !== "string") {
      return "";
    }
    return value
      .replace(/[<>{}`$]/g, "")
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim();
  }

  function scrollToSection(sectionId, focusSelector) {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (focusSelector) {
      window.setTimeout(function () {
        const el = document.querySelector(focusSelector);
        if (el && typeof el.focus === "function") {
          el.focus({ preventScroll: true });
        }
      }, 450);
    }
  }

  /* ------------------------------------------------------------------------
     2. Mobile Navigation Toggle
     ------------------------------------------------------------------------ */
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    const navLinks = primaryNav.querySelectorAll("a, button");
    navLinks.forEach(function (item) {
      item.addEventListener("click", function () {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. Header & Hero Navigation CTAs
     ------------------------------------------------------------------------ */
  const headerPilotBtn = document.getElementById("headerPilotBtn");
  const heroPilotBtn = document.getElementById("heroPilotBtn");
  const heroDemoBtn = document.getElementById("heroDemoBtn");
  const cardDemoBtn = document.getElementById("cardDemoBtn");

  if (headerPilotBtn) {
    headerPilotBtn.addEventListener("click", function () {
      scrollToSection("pilot", "#operatorName");
    });
  }

  if (heroPilotBtn) {
    heroPilotBtn.addEventListener("click", function () {
      scrollToSection("pilot", "#operatorName");
    });
  }

  /* ------------------------------------------------------------------------
     4. Scroll Reveal Animations (IntersectionObserver)
     ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealItems.length > 0) {
    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ------------------------------------------------------------------------
     5. Graceful Image Fallback (Zero Broken Icons if Assets Not Uploaded Yet)
     ------------------------------------------------------------------------ */
  const deploymentImages = document.querySelectorAll(".deployment-img");
  deploymentImages.forEach(function (img) {
    img.addEventListener("error", function () {
      img.classList.add("is-fallback");
    });
  });

  /* ------------------------------------------------------------------------
     6. Interactive 30-Second WhatsApp Intake Sandbox
     ------------------------------------------------------------------------ */
  const startDemoBtn = document.getElementById("startDemoBtn");
  const resetDemoBtn = document.getElementById("resetDemoBtn");
  const chatStream = document.getElementById("chatStream");
  const demoStatus = document.getElementById("demoStatus");
  let demoTimers = [];

  const demoSteps = [
    {
      delay: 250,
      sender: "client",
      label: "VIP Client • 02:15 AM GST",
      text: "Hi, arriving at DXB Terminal 3 at 6 AM. Need a Lamborghini Huracán EVO for 3 days. Is it available?",
      status: "Inbound Webhook Received • Parsing Intent..."
    },
    {
      delay: 1450,
      sender: "bot",
      label: "Pravah Engine • 02:15:08 AM",
      text: "Good evening. Huracán EVO is confirmed available for 06:00 AM DXB delivery. 3-day rate: AED 14,400 + AED 10,000 refundable hold. Please share your Passport & IDP photo to lock the slot.",
      status: "Step 1/3 Complete • Availability & FX Quote Sent"
    },
    {
      delay: 2900,
      sender: "client",
      label: "VIP Client • 02:15:21 AM",
      text: "[Uploaded: UK_Passport_MRZ.jpg & IDP_2026.jpg] — Ready to authorize in GBP or AED.",
      status: "Step 2/3 Running • Extracting Passport & IDP..."
    },
    {
      delay: 4300,
      sender: "bot",
      label: "Pravah Engine • 02:15:28 AM",
      text: "KYC Verified (Passport Valid through 2031, IDP Compliant). Reservation dossier #DXB-88421 synced to dispatch & pre-auth link dispatched. Total processing time: 28 seconds.",
      status: "Step 3/3 Complete • Verified Reservation Ready"
    }
  ];

  function clearDemoTimers() {
    demoTimers.forEach(function (timerId) {
      window.clearTimeout(timerId);
    });
    demoTimers = [];
  }

  function appendChatBubble(step) {
    if (!chatStream) {
      return;
    }
    const bubble = document.createElement("div");
    bubble.className =
      step.sender === "client" ? "chat-bubble chat-bubble-client" : "chat-bubble chat-bubble-bot";

    const meta = document.createElement("span");
    meta.className = "chat-meta";
    meta.textContent = step.label;

    const body = document.createElement("span");
    body.textContent = step.text;

    bubble.appendChild(meta);
    bubble.appendChild(body);
    chatStream.appendChild(bubble);
    chatStream.scrollTop = chatStream.scrollHeight;

    if (demoStatus) {
      demoStatus.textContent = step.status;
    }
  }

  function resetDemo() {
    clearDemoTimers();
    if (!chatStream) {
      return;
    }
    while (chatStream.firstChild) {
      chatStream.removeChild(chatStream.firstChild);
    }
    const placeholder = document.createElement("div");
    placeholder.className = "chat-placeholder";
    placeholder.textContent =
      'Click "Simulate 2:15 AM Dubai Inquiry" above to run the 3-step autonomous intake sequence.';
    chatStream.appendChild(placeholder);

    if (demoStatus) {
      demoStatus.textContent = "Standby • Deterministic Engine Ready";
    }
  }

  function runDemoSequence() {
    if (!chatStream) {
      return;
    }
    clearDemoTimers();
    while (chatStream.firstChild) {
      chatStream.removeChild(chatStream.firstChild);
    }
    if (demoStatus) {
      demoStatus.textContent = "Initializing 2:15 AM Dubai Simulation...";
    }

    demoSteps.forEach(function (step) {
      const id = window.setTimeout(function () {
        appendChatBubble(step);
      }, step.delay);
      demoTimers.push(id);
    });
  }

  if (startDemoBtn) {
    startDemoBtn.addEventListener("click", runDemoSequence);
  }
  if (resetDemoBtn) {
    resetDemoBtn.addEventListener("click", resetDemo);
  }
  if (heroDemoBtn) {
    heroDemoBtn.addEventListener("click", function () {
      scrollToSection("simulator");
      window.setTimeout(runDemoSequence, 450);
    });
  }
  if (cardDemoBtn) {
    cardDemoBtn.addEventListener("click", function () {
      scrollToSection("simulator");
      window.setTimeout(runDemoSequence, 450);
    });
  }

  /* ------------------------------------------------------------------------
     7. Multi-Currency Deposit Calculator
     ------------------------------------------------------------------------ */
  const calcTier = document.getElementById("calcTier");
  const calcDays = document.getElementById("calcDays");
  const calcCurrency = document.getElementById("calcCurrency");
  const calcDailyRate = document.getElementById("calcDailyRate");
  const calcRentalTotal = document.getElementById("calcRentalTotal");
  const calcDeposit = document.getElementById("calcDeposit");
  const calcGrandTotal = document.getElementById("calcGrandTotal");

  // Base figures in AED
  const TIER_RATES_AED = {
    supercar: { daily: 4800, deposit: 10000 },
    ultra: { daily: 5500, deposit: 12000 },
    chauffeur: { daily: 2600, deposit: 4000 }
  };

  // Institutional FX multipliers relative to AED
  const FX_FROM_AED = {
    AED: 1.0,
    USD: 0.2723,
    EUR: 0.251,
    GBP: 0.214
  };

  function formatMoney(amount, currency) {
    const rounded = Math.round(amount);
    return currency + " " + rounded.toLocaleString("en-US");
  }

  function updateCalculator() {
    if (!calcTier || !calcDays || !calcCurrency) {
      return;
    }
    const tier = TIER_RATES_AED[calcTier.value] || TIER_RATES_AED.supercar;
    let days = parseInt(calcDays.value, 10);
    if (Number.isNaN(days) || days < 1) {
      days = 1;
    } else if (days > 30) {
      days = 30;
    }

    const currency = FX_FROM_AED[calcCurrency.value] ? calcCurrency.value : "AED";
    const fx = FX_FROM_AED[currency];

    const daily = tier.daily * fx;
    const rental = daily * days;
    const deposit = tier.deposit * fx;
    const grandTotal = rental + deposit;

    if (calcDailyRate) calcDailyRate.textContent = formatMoney(daily, currency);
    if (calcRentalTotal) calcRentalTotal.textContent = formatMoney(rental, currency);
    if (calcDeposit) calcDeposit.textContent = formatMoney(deposit, currency);
    if (calcGrandTotal) calcGrandTotal.textContent = formatMoney(grandTotal, currency);
  }

  if (calcTier && calcDays && calcCurrency) {
    calcTier.addEventListener("change", updateCalculator);
    calcDays.addEventListener("input", updateCalculator);
    calcCurrency.addEventListener("change", updateCalculator);
    updateCalculator();
  }

  /* ------------------------------------------------------------------------
     8. Live n8n-Connected 14-Day Fleet Pilot Form
     ------------------------------------------------------------------------ */
  const pilotForm = document.getElementById("pilotForm");
  const pilotSubmitBtn = document.getElementById("pilotSubmitBtn");
  const formError = document.getElementById("formError");
  const pilotReceipt = document.getElementById("pilotReceipt");
  const receiptSubtitle = document.getElementById("receiptSubtitle");
  const receiptDetails = document.getElementById("receiptDetails");
  const newPilotBtn = document.getElementById("newPilotBtn");

  function generateReferenceId() {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 5; i += 1) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "PI-" + y + m + d + "-" + rand;
  }

  function showFormError(message) {
    if (!formError) {
      return;
    }
    formError.textContent = message;
    formError.hidden = false;
  }

  function hideFormError() {
    if (!formError) {
      return;
    }
    formError.textContent = "";
    formError.hidden = true;
  }

  function renderReceipt(payload, modeNote) {
    if (!pilotForm || !pilotReceipt || !receiptDetails) {
      return;
    }
    while (receiptDetails.firstChild) {
      receiptDetails.removeChild(receiptDetails.firstChild);
    }

    const fields = [
      { label: "Reference ID", value: payload.referenceId },
      { label: "Timestamp (UTC)", value: payload.timestamp },
      { label: "Operator Name", value: payload.operatorName },
      { label: "Fleet / Company", value: payload.companyName },
      { label: "Fleet Size", value: payload.fleetSize },
      { label: "WhatsApp Number", value: payload.whatsapp },
      { label: "Operating Hub", value: payload.hub },
      { label: "Intake Source", value: payload.source }
    ];

    fields.forEach(function (item) {
      const wrapper = document.createElement("div");
      wrapper.className = "receipt-item";

      const dt = document.createElement("dt");
      dt.textContent = item.label;

      const dd = document.createElement("dd");
      dd.textContent = item.value;

      wrapper.appendChild(dt);
      wrapper.appendChild(dd);
      receiptDetails.appendChild(wrapper);
    });

    if (receiptSubtitle && modeNote) {
      receiptSubtitle.textContent = modeNote;
    }

    pilotForm.hidden = true;
    pilotReceipt.hidden = false;
  }

  if (pilotForm) {
    pilotForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      hideFormError();

      // Anti-spam honeypot check
      const honeypot = document.getElementById("website");
      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }

      const operatorName = sanitizeText(document.getElementById("operatorName").value);
      const companyName = sanitizeText(document.getElementById("companyName").value);
      const fleetSize = sanitizeText(document.getElementById("fleetSize").value);
      const whatsapp = sanitizeText(document.getElementById("whatsapp").value);
      const hub = sanitizeText(document.getElementById("hub").value);
      const consent = document.getElementById("privacyConsent").checked;

      const nameRegex = /^[a-zA-Z0-9\s.'\-&,]{2,100}$/;
      const phoneRegex = /^\+?[0-9\s\-().]{7,22}$/;

      if (!nameRegex.test(operatorName)) {
        showFormError("Please enter a valid Operator Name (2–100 standard characters).");
        return;
      }
      if (!nameRegex.test(companyName)) {
        showFormError("Please enter a valid Fleet or Company Name.");
        return;
      }
      if (!fleetSize) {
        showFormError("Please select your active Fleet Size.");
        return;
      }
      if (!phoneRegex.test(whatsapp)) {
        showFormError("Please enter a valid international WhatsApp number (e.g., +971 50 000 0000).");
        return;
      }
      if (!hub) {
        showFormError("Please select your primary Operating Hub.");
        return;
      }
      if (!consent) {
        showFormError("Please accept the Privacy Policy and Terms of Service to continue.");
        return;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        referenceId: generateReferenceId(),
        operatorName: operatorName,
        companyName: companyName,
        fleetSize: fleetSize,
        whatsapp: whatsapp,
        hub: hub,
        source: "Pravah International Web"
      };

      const originalBtnText = pilotSubmitBtn.textContent;
      pilotSubmitBtn.disabled = true;
      pilotSubmitBtn.textContent = "Transmitting to Intake Engine...";

      try {
        if (
          !N8N_WEBHOOK_URL ||
          N8N_WEBHOOK_URL === "PASTE_YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE"
        ) {
          throw new Error("WEBHOOK_UNCONFIGURED");
        }

        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("HTTP_" + response.status);
        }

        renderReceipt(
          payload,
          "Your fleet pilot dossier has been transmitted to our live n8n intake engine."
        );
      } catch (err) {
        if (err && err.message === "WEBHOOK_UNCONFIGURED") {
          renderReceipt(
            payload,
            "Preview Receipt Generated: Configure N8N_WEBHOOK_URL in app.js with your live HTTPS webhook to dispatch payloads."
          );
        } else {
          showFormError(
            "Unable to reach the intake endpoint right now. Please verify your connection or webhook CORS policy and try again."
          );
        }
      } finally {
        pilotSubmitBtn.disabled = false;
        pilotSubmitBtn.textContent = originalBtnText;
      }
    });
  }

  if (newPilotBtn && pilotForm && pilotReceipt) {
    newPilotBtn.addEventListener("click", function () {
      pilotForm.reset();
      pilotReceipt.hidden = true;
      pilotForm.hidden = false;
      hideFormError();
      const firstInput = document.getElementById("operatorName");
      if (firstInput) {
        firstInput.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. GDPR / CCPA Cookie Consent Banner
     ------------------------------------------------------------------------ */
  const cookieBanner = document.getElementById("cookieBanner");
  const cookieAcceptBtn = document.getElementById("cookieAcceptBtn");
  const cookieEssentialBtn = document.getElementById("cookieEssentialBtn");

  function saveCookieChoice(choice) {
    try {
      window.localStorage.setItem(
        COOKIE_STORAGE_KEY,
        JSON.stringify({ choice: choice, savedAt: new Date().toISOString() })
      );
    } catch (e) {
      // Storage unavailable in restricted browsing mode
    }
    if (cookieBanner) {
      cookieBanner.hidden = true;
    }
  }

  if (cookieBanner) {
    let existing = null;
    try {
      existing = window.localStorage.getItem(COOKIE_STORAGE_KEY);
    } catch (e) {
      existing = null;
    }
    if (!existing) {
      cookieBanner.hidden = false;
    }
  }

  if (cookieAcceptBtn) {
    cookieAcceptBtn.addEventListener("click", function () {
      saveCookieChoice("accepted");
    });
  }

  if (cookieEssentialBtn) {
    cookieEssentialBtn.addEventListener("click", function () {
      saveCookieChoice("essential_only");
    });
  }

  /* ------------------------------------------------------------------------
     10. Dynamic Copyright Year
     ------------------------------------------------------------------------ */
  const yearEl = document.getElementById("currentYear");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
