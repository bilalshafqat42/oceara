export function createWhatsAppLink({
  number,
  lead,
  reference,
}) {
  const cleanNumber = String(number).replace(/\D/g, "");

  const message = [
    "Hello Refine Team,",
    "",
    "I submitted an Oceara enquiry through the website.",
    "",
    `Reference: ${reference}`,
    `Name: ${lead.fullName}`,
    `Enquiry: ${lead.enquiryType}`,
    `Requirement: ${lead.enquiryOption}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Request: ${lead.request}`,
  ].join("\n");

  return (
    `https://wa.me/${cleanNumber}` +
    `?text=${encodeURIComponent(message)}`
  );
}