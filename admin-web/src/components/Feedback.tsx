export function ErrorBox({ message }: { message: string | null }) {
  return message ? <div className="alert error">{message}</div> : null;
}
export function Loading() {
  return <div className="muted">Loading…</div>;
}
export function Empty({ text }: { text: string }) {
  return <div className="empty">{text}</div>;
}