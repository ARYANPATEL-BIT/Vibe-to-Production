// Structured logs: one JSON object per line, so your host can search and filter them.
// Never log passwords, tokens, full card numbers or whole request bodies.
type Fields = Record<string, unknown>;

function write(level: "info" | "warn" | "error", msg: string, fields: Fields = {}) {
  const line = JSON.stringify({ level, msg, time: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (msg: string, fields?: Fields) => write("info", msg, fields),
  warn: (msg: string, fields?: Fields) => write("warn", msg, fields),
  error: (msg: string, fields?: Fields) => write("error", msg, fields),
};
