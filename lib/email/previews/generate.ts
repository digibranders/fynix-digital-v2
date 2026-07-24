import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildAdminNotificationEmail,
  buildUserAutoReplyEmail,
  type ContactSubmission,
} from "../templates";

const SAMPLE: ContactSubmission = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  phone: "+91 98765 43210",
  services: ["SEO", "Development", "CRO"],
  message:
    "We're looking to revamp our SaaS security platform's marketing site and improve our organic lead flow. Would love to discuss timelines and pricing.",
};

const userEmail = buildUserAutoReplyEmail(SAMPLE);
const adminEmail = buildAdminNotificationEmail(SAMPLE);

writeFileSync(join(__dirname, "user-autoreply.html"), userEmail.html, "utf-8");
writeFileSync(join(__dirname, "admin-notification.html"), adminEmail.html, "utf-8");

console.log("Preview files written:");
console.log(" - lib/email/previews/user-autoreply.html");
console.log(" - lib/email/previews/admin-notification.html");
