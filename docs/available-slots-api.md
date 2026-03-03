# Available Slots API (multi-court)

`GET /courts/available-slots` returns available slots only for one or more courts. Each court has `id`, `name`, and `available_slots` (time range + weekdays when that slot is free).

**Query parameters:**

| Param        | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `court_ids` | string | No       | Comma-separated court UUIDs; omit for all courts. |
| `start_time`| string | No*      | Start of window in `HH:mm`. Use with `hours` to filter slots. |
| `hours`     | number | No*      | Duration in hours (0.5–24). Use with `start_time`. *If one is set, both must be set.* |

---

## Get available slots for all courts

```bash
curl -s -X GET "https://your-api.up.railway.app/courts/available-slots" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

**Sample response (200):**

```json
{
  "success": true,
  "courts": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Court 1",
      "available_slots": [
        { "start_time": "06:00", "end_time": "07:00", "available_days": [0, 1, 2, 3, 4, 5, 6] },
        { "start_time": "07:00", "end_time": "08:00", "available_days": [0, 2, 4, 6] },
        { "start_time": "14:00", "end_time": "15:00", "available_days": [1, 3, 5] }
      ]
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "Court 2",
      "available_slots": [
        { "start_time": "09:00", "end_time": "10:00", "available_days": [0, 1, 2, 3, 4, 5, 6] }
      ]
    }
  ]
}
```

---

## Get available slots for specific courts

```bash
curl -s -X GET "https://your-api.up.railway.app/courts/available-slots?court_ids=a1b2c3d4-e5f6-7890-abcd-ef1234567890,b2c3d4e5-f6a7-8901-bcde-f12345678901" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

**Sample response (200):** Same shape; `courts` contains only the requested courts (or fewer if some IDs are not found / not in academy).

---

## Get available slots in a time window (start_time + hours)

Returns only slots that overlap the given window (e.g. 14:00 for 2 hours → 14:00–16:00). Both `start_time` and `hours` must be provided together.

```bash
curl -s -X GET "https://your-api.up.railway.app/courts/available-slots?start_time=14:00&hours=2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

With specific courts:

```bash
curl -s -X GET "https://your-api.up.railway.app/courts/available-slots?court_ids=UUID1,UUID2&start_time=09:00&hours=3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

**Sample response (200):** Same shape; `available_slots` only includes slots overlapping the window (e.g. 14:00–15:00, 15:00–16:00 when `start_time=14:00` and `hours=2`). The window is clamped to academy opening/closing times.

---

## Local development

```bash
curl -s -X GET "http://localhost:3000/courts/available-slots" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept: application/json"
```

---

## Unauthorized (401)

```bash
curl -s -X GET "http://localhost:3000/courts/available-slots"
```

**Sample response (401):**

```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

---

## Invalid court_ids (400)

```bash
curl -s -X GET "http://localhost:3000/courts/available-slots?court_ids=not-a-uuid,another-bad" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Sample response (400):**

```json
{
  "success": false,
  "message": "Invalid court id(s); each must be a UUID",
  "code": "VALIDATION_ERROR"
}
```

---

## Notes

- Replace `https://your-api.up.railway.app` (or `http://localhost:3000`) and `YOUR_JWT_TOKEN` with your base URL and a token from login/register.
- `available_days`: `0` = Sunday … `6` = Saturday; only weekdays when that time slot is free are listed.
- If a court has no free slots in working hours, it still appears in `courts` with `"available_slots": []`.
