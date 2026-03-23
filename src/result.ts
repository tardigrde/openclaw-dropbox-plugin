/**
 * Tool result helpers — wraps payloads into MCP content format.
 */

/** Wrap a structured payload as a JSON text tool result. */
export function jsonResult(payload: unknown): {
  content: Array<{ type: "text"; text: string }>;
  details: unknown;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
    details: payload,
  };
}

/** Plain text tool result. */
export function textResult(text: string): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [{ type: "text", text }],
  };
}
