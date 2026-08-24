export const ADMIN_EMAIL = "ivan.p@example.net";
export const ADMIN_PASSWORD = "HanoraAdmin2026";
export const ADMIN_NAME = "Hanora Admin";
export const SESSION_KEY = "hanora-admin-session";

const FIRST = [
  "Aisha", "Amelia", "Ananya", "Andre", "Aria", "Benjamin", "Camila", "Chloe",
  "Daniel", "Elena", "Farah", "Gabriel", "Hana", "Hassan", "Isabella", "James",
  "Jia", "Jonas", "Kai", "Lara", "Leila", "Luca", "Maya", "Mei",
  "Nadia", "Noah", "Omar", "Priya", "Rafael", "Sana", "Sofia", "Yusuf",
];

const LAST = [
  "Rahman", "Chen", "Okoye", "Patel", "Santos", "Nakamura", "Berg", "Kowalski",
  "Alvarez", "Ibrahim", "Kim", "Rossi", "Nair", "Dubois", "Silva", "Andersen",
  "Hassan", "Okafor", "Nguyen", "Moreau", "Costa", "Johansson", "Khan", "Park",
  "Fernandez", "Mensah", "Tanaka", "Sharma", "Novak", "Williams", "Diallo", "Vogel",
];

const COMPANIES = [
  ["Unilever", "unilever.com"],
  ["Nike", "nike.com"],
  ["Airbnb", "airbnb.com"],
  ["Spotify", "spotify.com"],
  ["L'Oréal", "loreal.com"],
  ["Adobe", "adobe.com"],
  ["Samsung", "samsung.com"],
  ["IKEA", "ikea.com"],
  ["Emirates", "emirates.com"],
  ["Shopify", "shopify.com"],
  ["HubSpot", "hubspot.com"],
  ["Salesforce", "salesforce.com"],
  ["WPP", "wpp.com"],
  ["Publicis", "publicisgroupe.com"],
  ["Ogilvy", "ogilvy.com"],
  ["BBDO", "bbdo.com"],
  ["Nestlé", "nestle.com"],
  ["PepsiCo", "pepsico.com"],
  ["Coca-Cola", "coca-cola.com"],
  ["Red Bull", "redbull.com"],
  ["Patagonia", "patagonia.com"],
  ["Starbucks", "starbucks.com"],
  ["Toyota", "toyota.com"],
  ["BMW", "bmw.com"],
];

const ROLES = [
  "Brand Director",
  "CMO",
  "Campaign Lead",
  "Head of Growth",
  "Creative Director",
  "Performance Lead",
  "Global Marketing Manager",
  "Head of Brand",
];

const CITIES = [
  "London", "Mumbai", "Singapore", "New York", "Dubai", "São Paulo",
  "Tokyo", "Berlin", "Paris", "Toronto", "Sydney", "Seoul",
  "Amsterdam", "Mexico City", "Stockholm", "Cape Town",
];

const PLANS = ["Founding", "Review", "Growth", "Founding", "Review", "Founding"];

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ".");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function joinedDate(index) {
  const start = Date.UTC(2026, 0, 8);
  const day = start + index * 2.1 * 86400000;
  const d = new Date(day);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function lastActive(index, status) {
  if (status !== "Active") return "—";
  const hours = [1, 3, 6, 11, 18, 26, 40, 2, 8, 14, 22, 31][index % 12];
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const usedEmails = new Set();

export const USERS = Array.from({ length: 96 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length];
  const [company, domain] = COMPANIES[i % COMPANIES.length];
  const status = i < 94 ? "Active" : "Invited";
  let email = `${slug(first)}.${slug(last)}@${domain}`;
  if (usedEmails.has(email)) email = `${slug(first)}.${slug(last)}${i + 1}@${domain}`;
  usedEmails.add(email);
  return {
    id: `usr_${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    email,
    company,
    role: ROLES[i % ROLES.length],
    city: CITIES[i % CITIES.length],
    plan: PLANS[i % PLANS.length],
    status,
    joined: joinedDate(i),
    lastActive: lastActive(i, status),
  };
});

export const STATS = {
  total: USERS.length,
  active: USERS.filter((u) => u.status === "Active").length,
  invited: USERS.filter((u) => u.status === "Invited").length,
  newThisWeek: 11,
};

export function saveAdminSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    at: Date.now(),
  }));
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAdminCredentials(email, password) {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
