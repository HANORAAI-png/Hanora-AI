const assert = require("node:assert/strict");
const { parseJSON } = require("../lib/json");
const { validateLaunch, validatePublicHttpsUrl } = require("../lib/validation");

assert.deepEqual(parseJSON("```json\n{\"message\":\"use {context}\"}\n```"), { message: "use {context}" });
const campaign = { summary: "Approved copy", facebookCopy: "Approved copy", instagramCopy: "Approved copy", imageUrl: "https://cdn.example.com/image.jpg", dailyBudgetUsd: 20 };
assert.equal(validateLaunch(campaign, ["Facebook"]), null);
assert.equal(validateLaunch(campaign, ["Instagram"]), null);
assert.match(validateLaunch({ ...campaign, dailyBudgetUsd: -1 }, ["Google Ads"]), /dailyBudgetUsd/);
assert.match(validateLaunch(campaign, ["TikTok"]), /unsupported/);
assert.equal(validatePublicHttpsUrl("http://example.com"), false);
console.log("core checks passed");