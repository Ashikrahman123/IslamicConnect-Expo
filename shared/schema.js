/**
 * Shared schema definitions for both client and server
 */

// User schema
const userSchema = {
  id: "number",
  username: "string",
  password: "string", // hashed on server
  email: "string",
  name: "string",
  preferredLanguage: "string", // 'en', 'ar', etc.
  createdAt: "date",
  updatedAt: "date",
};

// User settings schema
const userSettingsSchema = {
  userId: "number",
  theme: "string", // 'light', 'dark'
  calculationMethod: "string", // For prayer times calculation
  notificationsEnabled: "boolean",
  autoPlayAudio: "boolean",
};

// Audio content schema
const audioContentSchema = {
  id: "number",
  title: "string",
  description: "string",
  speaker: "string",
  category: "string",
  url: "string",
  duration: "number", // in seconds
  imageUrl: "string",
  createdAt: "date",
};

// Islamic event schema
const islamicEventSchema = {
  id: "number",
  title: "string",
  description: "string",
  hijriDate: "string",
  gregorianDate: "date",
  type: "string", // 'holiday', 'important_day', etc.
};

module.exports = {
  userSchema,
  userSettingsSchema,
  audioContentSchema,
  islamicEventSchema,
};
