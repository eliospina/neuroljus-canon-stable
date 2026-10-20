import type { NextApiRequest, NextApiResponse } from "next";

export const SECRET = "test-line-secret";

export function mockReq(body: unknown, opts: { method?: string; secret?: string | null; headers?: Record<string, string> } = {}): NextApiRequest {
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.secret !== null) headers["x-line-secret"] = opts.secret ?? SECRET;
  return { method: opts.method ?? "POST", headers, body } as unknown as NextApiRequest;
}

export type MockRes = NextApiResponse & { statusCode: number; json_: any; headers_: Record<string, string> };

export function mockRes(): MockRes {
  const res: any = { statusCode: 200, json_: undefined, headers_: {}, writableEnded: false };
  res.setHeader = (k: string, v: string) => ((res.headers_[k.toLowerCase()] = v), res);
  res.status = (c: number) => ((res.statusCode = c), res);
  res.json = (b: unknown) => ((res.json_ = b), (res.writableEnded = true), res);
  return res as MockRes;
}
