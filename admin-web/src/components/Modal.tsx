import type { ReactNode } from 'react';

export default function Modal({ title, open, onClose, children }:
  { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}