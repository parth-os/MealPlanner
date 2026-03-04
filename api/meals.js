import { getAll } from "@vercel/edge-config";

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const MAX_RANGE_DAYS = 62;
const MAX_MEAL_LEN = 220;

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(payload));
}

function normalizeText(value, maxLen = MAX_MEAL_LEN) {
  const normalized = String(value ?? "")
    .normalize("NFKC")
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();

  return Array.from(normalized).slice(0, maxLen).join("");
}

function sanitizeMealField(value) {
  const cleaned = normalizeText(value);
  return cleaned.length ? cleaned : "";
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

function toDateObj(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`);
}

function dateDiffInclusive(start, end) {
  return Math.floor((toDateObj(end).getTime() - toDateObj(start).getTime()) / 86400000) + 1;
}

function dateToKey(dateStr) {
  return `meal_${dateStr.replace(/-/g, "_")}`;
}

function keyToDate(key) {
  if (!/^meal_\d{4}_\d{2}_\d{2}$/.test(key)) {
    return "";
  }
  return key.slice(5).replace(/_/g, "-");
}

function enumerateDates(startDate, endDate) {
  const list = [];
  const cursor = toDateObj(startDate);
  const last = toDateObj(endDate);

  while (cursor.getTime() <= last.getTime()) {
    const year = cursor.getUTCFullYear();
    const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
    const day = String(cursor.getUTCDate()).padStart(2, "0");
    list.push(`${year}-${month}-${day}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return list;
}

async function patchEdgeConfigItem(item) {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!edgeConfigId || !vercelApiToken) {
    throw new Error("Missing EDGE_CONFIG_ID or VERCEL_API_TOKEN environment variable.");
  }

  const qs = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const url = `https://api.vercel.com/v1/edge-config/${encodeURIComponent(edgeConfigId)}/items${qs}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${vercelApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items: [item] }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Edge Config write failed (${response.status}): ${text}`);
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const start = normalizeText(req.query.start, 10);
      const end = normalizeText(req.query.end, 10);

      if (!isIsoDate(start) || !isIsoDate(end)) {
        return json(res, 400, { error: "start and end must use YYYY-MM-DD" });
      }

      const diff = dateDiffInclusive(start, end);
      if (diff <= 0) {
        return json(res, 400, { error: "end must be on or after start" });
      }
      if (diff > MAX_RANGE_DAYS) {
        return json(res, 400, { error: `max range is ${MAX_RANGE_DAYS} days` });
      }

      const keys = enumerateDates(start, end).map(dateToKey);
      const byKey = await getAll(keys);

      const meals = {};
      for (const [key, value] of Object.entries(byKey)) {
        const date = keyToDate(key);
        if (!date || !value || typeof value !== "object") {
          continue;
        }

        meals[date] = {
          breakfast: sanitizeMealField(value.breakfast),
          lunch: sanitizeMealField(value.lunch),
          dinner: sanitizeMealField(value.dinner),
        };
      }

      return json(res, 200, { ok: true, meals });
    } catch (error) {
      return json(res, 500, { error: error.message || "Failed to load meals" });
    }
  }

  if (req.method === "PUT") {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const date = normalizeText(body.date, 10);

      if (!isIsoDate(date)) {
        return json(res, 400, { error: "date must use YYYY-MM-DD" });
      }

      const breakfast = sanitizeMealField(body.breakfast);
      const lunch = sanitizeMealField(body.lunch);
      const dinner = sanitizeMealField(body.dinner);

      const key = dateToKey(date);
      if (!breakfast && !lunch && !dinner) {
        await patchEdgeConfigItem({ operation: "delete", key });
        return json(res, 200, { ok: true });
      }

      await patchEdgeConfigItem({
        operation: "upsert",
        key,
        value: {
          breakfast,
          lunch,
          dinner,
          updatedAt: new Date().toISOString(),
        },
      });

      return json(res, 200, { ok: true });
    } catch (error) {
      return json(res, 500, { error: error.message || "Failed to save meal" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const date = normalizeText(body.date, 10);
      if (!isIsoDate(date)) {
        return json(res, 400, { error: "date must use YYYY-MM-DD" });
      }

      await patchEdgeConfigItem({ operation: "delete", key: dateToKey(date) });
      return json(res, 200, { ok: true });
    } catch (error) {
      return json(res, 500, { error: error.message || "Failed to delete meal" });
    }
  }

  return json(res, 405, { error: "Method not allowed" });
}
