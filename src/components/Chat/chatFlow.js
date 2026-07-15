export const LANGUAGES = [
  {
    id: "english",
    label: "English",
    locale: "en",
  },
  {
    id: "arabic",
    label: "العربية",
    locale: "ar",
  },
  {
    id: "russian",
    label: "Русский",
    locale: "ru",
  },
];

export const ENQUIRY_TYPES = [
  {
    id: "buyer-investor",
    label: "Buyer / Investor",
  },
  {
    id: "broker-agent",
    label: "Broker / Agent",
  },
  {
    id: "developer",
    label: "Developer",
  },
  {
    id: "customer-support",
    label: "Customer Support",
  },
  {
    id: "other",
    label: "Other",
  },
];

export const ENQUIRY_OPTIONS = {
  "buyer-investor": [
    {
      id: "buying-residence",
      label: "Buying A Residence",
    },
    {
      id: "investment-opportunity",
      label: "Investment Opportunity",
    },
    {
      id: "payment-plan",
      label: "Payment Plan",
    },
    {
      id: "project-information",
      label: "Project Information",
    },
  ],

  "broker-agent": [
    {
      id: "new-registration",
      label: "New Registration",
    },
    {
      id: "existing-partner",
      label: "Existing Partner",
    },
    {
      id: "marketing-materials",
      label: "Marketing Materials",
    },
  ],

  developer: [
    {
      id: "new-developer",
      label: "New Developer",
    },
    {
      id: "existing-developer",
      label: "Existing Developer",
    },
  ],

  "customer-support": [
    {
      id: "existing-enquiry",
      label: "Existing Enquiry",
    },
    {
      id: "project-support",
      label: "Project Support",
    },
    {
      id: "general-assistance",
      label: "General Assistance",
    },
  ],

  other: [
    {
      id: "general-enquiry",
      label: "General Enquiry",
    },
  ],
};
