# NL-VISION v2 — setup (what to buy / do)

**Branch:** `lab/nl-vision-v2`  
**Engine:** MediaPipe **Tasks Vision** (`@mediapipe/tasks-vision@1.0.0`) — Face Landmarker + Hand Landmarker  
**Not:** emotion AI. Raw landmarks + numeric signals only.

---

## Do you need to buy anything?

**Usually no.** For the lab to work you need:

| Item | Required? | Notes |
| --- | --- | --- |
| Mac / PC with webcam | Yes | Built-in FaceTime camera is enough to start |
| Chrome or Edge (latest) | Strongly yes | Best WebGL / WASM support for MediaPipe |
| Camera permission | Yes | Allow when the browser asks |
| Good lighting | Yes (free) | Face toward a window or desk lamp; avoid strong backlight |
| USB webcam 1080p | Optional | Helps in dark rooms; Logitech C920/C922-class is fine |
| External mic | No | Vision lab does not use audio |
| GPU / NVIDIA | No | Uses browser GPU (Metal/WebGL) or CPU fallback |
| Phone | Optional | Can test later; desktop first is simpler |
| Cloud AI key | No for vision | Camera stays on-device. Chat is separate (`CARE_REFLECTION_PROVIDER`) |

**Do not buy** “AI cameras”, emotion-AI gadgets, or medical devices for this prototype.

---

## Checklist so it actually works

1. **Power + Amphetamine** if you close the lid while models download the first time.
2. `git checkout lab/nl-vision-v2 && npm install && npm run dev`
3. Open **http://localhost:3000/labs/nl-vision** (must be localhost or HTTPS — browsers block camera on plain HTTP LAN IPs).
4. Click **Start camera** → Allow.
5. First run downloads WASM + `.task` models from Google CDN (~tens of MB). Wait until the mesh appears.
6. You should see:
   - green face mesh
   - blue/white hand skeleton
   - FPS / face / hands in the HUD
7. After ~5–10s: open Care Room → **Attach local signal** (same `localStorage` key as before).

### If camera fails

- System Settings → Privacy & Security → Camera → enable **Chrome/Edge/Cursor**.
- Close other apps using the camera (Zoom, Meet).
- Try Chrome if Safari is flaky with WASM.
- Prefer a well-lit face; Holistic-era models were picky in the dark — Tasks is better but still needs light.

### If models fail to load

- Need internet **once** for CDN models (`storage.googleapis.com` + jsDelivr WASM).
- Corporate VPN/firewall can block model download — try without VPN once.
- GPU delegate fails → code falls back to CPU (slower FPS, still works).

---

## What “latest tech” means here

| Old (v1) | New (v2) |
| --- | --- |
| `@mediapipe/holistic` legacy CDN scripts | `@mediapipe/tasks-vision` npm + WASM |
| `window.Holistic` | `FaceLandmarker` + `HandLandmarker` VIDEO mode |
| Ad-hoc UI | Care OS chrome + signal legend |
| Same storage key | `nlvision_holistic_v1` kept for Care Room / Robot Lab bridge |

---

## Optional later (not required to start)

- `ANTHROPIC_API_KEY` + `CARE_REFLECTION_PROVIDER=anthropic` for chat reflection (not vision).
- Better USB cam if you film real care-like lighting conditions for demos.
- Second monitor for Care Room beside the camera lab.

---

## Honesty reminder

Landmarks show **what the computer tracks**.  
They do **not** decode autistic communication. The caregiver still interprets.
