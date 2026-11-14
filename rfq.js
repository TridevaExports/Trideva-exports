/* =========================================================
   TRIDEVA EXPORTS
   rfq.js
   ========================================================= */

(() => {
  "use strict";

  const rfqForm = document.getElementById("rfqForm");
  const submitButton = document.getElementById("submitBtn");
  const whatsappLink = document.getElementById("whatsappLink");
  const formStatus = document.getElementById("formStatus");

  if (!rfqForm) {
    return;
  }

  const whatsappNumber = "919982755536";
  const businessEmail = "info@tridevaglobalexporter.com";

  function getFormData() {
    const formData = new FormData(rfqForm);

    return {
      fullName: String(formData.get("fullName") || "").trim(),
      company: String(formData.get("company") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      origin: String(formData.get("origin") || "").trim(),
      destination: String(formData.get("destination") || "").trim(),
      cargoType: String(formData.get("cargoType") || "").trim(),
      quantity: String(formData.get("quantity") || "").trim(),
      cargoDetails: String(
        formData.get("cargoDetails") || ""
      ).trim(),
      additionalNotes: String(
        formData.get("additionalNotes") || ""
      ).trim()
    };
  }

  function createRequestMessage(data) {
    return [
      "TRIDEVA EXPORTS - RFQ REQUEST",
      "",
      `Name: ${data.fullName}`,
      `Company: ${data.company}`,
      `Email: ${data.email}`,
      `Phone / WhatsApp: ${data.phone}`,
      "",
      `Origin: ${data.origin}`,
      `Destination: ${data.destination}`,
      `Cargo Type: ${data.cargoType}`,
      `Quantity / Volume: ${data.quantity}`,
      "",
      `Cargo Details: ${data.cargoDetails}`,
      "",
      `Additional Notes: ${
        data.additionalNotes || "None"
      }`
    ].join("\n");
  }

  function updateWhatsAppLink() {
    if (!whatsappLink) {
      return;
    }

    const data = getFormData();
    const message = createRequestMessage(data);

    whatsappLink.href =
      `https://wa.me/${whatsappNumber}?text=${
        encodeURIComponent(message)
      }`;
  }

  function showStatus(message, color = "var(--text-muted)") {
    if (!formStatus) {
      return;
    }

    formStatus.textContent = message;
    formStatus.style.color = color;
  }

  rfqForm.addEventListener("input", updateWhatsAppLink);
  rfqForm.addEventListener("change", updateWhatsAppLink);

  rfqForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!rfqForm.checkValidity()) {
      rfqForm.reportValidity();

      showStatus(
        "Please complete all required fields.",
        "var(--red)"
      );

      return;
    }

    const data = getFormData();
    const message = createRequestMessage(data);

    const emailSubject = encodeURIComponent(
      "New RFQ Request - TRIDEVA EXPORTS"
    );

    const emailBody = encodeURIComponent(message);

    const emailLink =
      `mailto:${businessEmail}` +
      `?subject=${emailSubject}` +
      `&body=${emailBody}`;

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Request Prepared";
    }

    showStatus(
      "Your RFQ is ready. Your email application will now open.",
      "var(--green)"
    );

    updateWhatsAppLink();

    window.location.href = emailLink;
  });

  if (whatsappLink) {
    whatsappLink.addEventListener("click", (event) => {
      if (!rfqForm.checkValidity()) {
        event.preventDefault();

        rfqForm.reportValidity();

        showStatus(
          "Please complete the required fields before using WhatsApp.",
          "var(--gold)"
        );

        return;
      }

      updateWhatsAppLink();
    });
  }

  updateWhatsAppLink();

})();
