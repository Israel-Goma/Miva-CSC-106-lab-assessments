document.addEventListener("DOMContentLoaded", () => {
  setupClipboardCopy();
  setupMessageForm();
});

function setupClipboardCopy() {
  const button = document.getElementById("copy-trigger");
  const status = document.getElementById("copy-status");
  if (!button || !status) return;

  button.addEventListener("click", async () => {
    const address = button.dataset.email;
    try {
      await navigator.clipboard.writeText(address);
      status.textContent = "Copied to clipboard!";
    } catch (err) {
      status.textContent = address;
    }

    setTimeout(() => {
      status.textContent = "";
    }, 3000);
  });
}

function setupMessageForm() {
  const form = document.getElementById("reach-form");
  if (!form) return;

  const status = document.getElementById("reach-status");

  const checks = [
    {
      id: "reach-name",
      wrap: "reach-name-field",
      note: "reach-name-note",
      run: (value) => (value.trim() ? "" : "Please enter your name."),
    },
    {
      id: "reach-email",
      wrap: "reach-email-field",
      note: "reach-email-note",
      run: (value) => {
        if (!value.trim()) return "Please enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? ""
          : "Enter a valid email address (e.g. name@example.com).";
      },
    },
    {
      id: "reach-phone",
      wrap: "reach-phone-field",
      note: "reach-phone-note",
      run: (value) => {
        const digitsOnly = value.replace(/[\s-]/g, "");
        if (!digitsOnly) return "Please enter your phone number.";
        return /^\d{7,15}$/.test(digitsOnly)
          ? ""
          : "Digits only, please (7-15 digits — spaces/dashes are fine).";
      },
    },
    {
      id: "reach-message",
      wrap: "reach-message-field",
      note: "reach-message-note",
      run: (value) => (value.trim() ? "" : "Please enter a message."),
    },
  ];

  function runCheck(check) {
    const input = document.getElementById(check.id);
    const wrap = document.getElementById(check.wrap);
    const note = document.getElementById(check.note);
    const message = check.run(input.value);
    wrap.classList.toggle("has-issue", Boolean(message));
    note.textContent = message;
    return { input, ok: !message };
  }

  checks.forEach((check) => {
    document.getElementById(check.id).addEventListener("input", () => runCheck(check));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let firstBadInput = null;
    let everythingOk = true;

    checks.forEach((check) => {
      const result = runCheck(check);
      if (!result.ok) {
        everythingOk = false;
        firstBadInput = firstBadInput || result.input;
      }
    });

    if (!everythingOk) {
      status.textContent = "Please fix the highlighted fields.";
      status.className = "reach-status is-bad";
      firstBadInput.focus();
      return;
    }

    const name = document.getElementById("reach-name").value.trim();
    const email = document.getElementById("reach-email").value.trim();
    const phone = document.getElementById("reach-phone").value.trim();
    const message = document.getElementById("reach-message").value.trim();

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`);

    status.textContent = "Looks good — opening your email client to send this message…";
    status.className = "reach-status is-good";
    window.location.href = `mailto:israel.goma@example.com?subject=${subject}&body=${body}`;
  });
}
