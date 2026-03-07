import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
  return { status: "ok", timestamp: Date.now() };
});
