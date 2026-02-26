export type CursorPayload = { createdAt: string; id: string };

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
}

export function decodeCursor(cursor: string): CursorPayload {
  const json = Buffer.from(cursor, 'base64').toString('utf8');
  const parsed = JSON.parse(json) as CursorPayload;

  if (!parsed?.createdAt || !parsed?.id) throw new Error('Invalid cursor');
  return parsed;
}