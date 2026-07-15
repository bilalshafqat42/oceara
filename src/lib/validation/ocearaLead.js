export function validateOcearaLead(data) {
  const errors = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }

  if (!data.phone || !/^\+?[0-9\s()-]{7,20}$/.test(data.phone)) {
    errors.phone =
      "Please enter a valid phone number with country code.";
  }

  if (
    !data.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.request || data.request.trim().length < 5) {
    errors.request =
      "Please provide a little more information about your request.";
  }

  if (data.consent !== true) {
    errors.consent =
      "Please confirm that we may contact you.";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}