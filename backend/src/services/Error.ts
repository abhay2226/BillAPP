import { QueryFailedError } from "typeorm";
export function isUniqueConstraintError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  if (err instanceof QueryFailedError) {
    const anyErr = err as any;
    if (anyErr.code === "23505") return true; 
    if (typeof anyErr.code === "string" && anyErr.code.includes("SQLITE_CONSTRAINT")) return true;
    if (anyErr.code === "ER_DUP_ENTRY" || anyErr.errno === 1062) return true; // MySQL
    const msg = String(anyErr.message || "");
    if (/unique|duplicate|UNIQUE constraint failed|duplicate key/i.test(msg)) return true;
  } else {
    const anyErr = err as any;
    const msg = String(anyErr?.message || "");
    if (/unique|duplicate|UNIQUE constraint failed|duplicate key/i.test(msg)) return true;
  }
  return false;
}

