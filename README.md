# MealPlanner (Static + Vercel Edge Config Persistence)

This app stays a simple static web UI (`index.html`, `styles.css`, `app.js`) and persists meals through a Vercel API function:

- `GET /api/meals?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `PUT /api/meals` with `{ date, breakfast, lunch, dinner }`
- `DELETE /api/meals` with `{ date }`

## Your Edge Config
- Name: `meals`
- ID: `ecfg_whpx7wcemzki0uhhszdahvganfny`

## Required environment variables (Vercel Project)
- `EDGE_CONFIG`
  - Automatically available when Edge Config `meals` is connected to the project.
- `EDGE_CONFIG_ID=ecfg_whpx7wcemzki0uhhszdahvganfny`
- `VERCEL_API_TOKEN=<token with permission to patch edge config items>`
- `VERCEL_TEAM_ID=<optional; only needed if token belongs to a team scope>`

## Data safety practices included
- Strict date validation (`YYYY-MM-DD`)
- Bounded read range (max 62 days per request)
- Unicode normalization (`NFKC`) and control-char stripping
- Whitespace collapsing and max-length truncation for meal fields
- Per-day key storage (`meal_YYYY_MM_DD`) to avoid bulk overwrite corruption

## Notes
- Reads use `@vercel/edge-config`.
- Writes use Vercel Edge Config Items PATCH API from server-side function (token never exposed to browser).
