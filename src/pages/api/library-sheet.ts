// src/pages/api/library-sheet.ts
//
// Returns one document's practical sheet in one language, so the /library
// page stays light. Reads the verified local library; no network, no logs.

import type { NextApiRequest, NextApiResponse } from "next";
import { getDoc } from "@/lib/library";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = typeof req.query.id === "string" ? req.query.id : "";
  const lang = req.query.lang === "es" || req.query.lang === "sv" ? req.query.lang : "en";
  const doc = id ? getDoc(id) : undefined;
  if (!doc) return res.status(404).json({ ok: false });
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
  return res.status(200).json({
    ok: true,
    id: doc.id,
    sheet: doc.sheet ? doc.sheet[lang] : null,
    abstract: doc.openText ? doc.abstract : null,
    license: doc.license,
  });
}
