function TrailerModal({ open, title, onClose }) {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose}></div>
      <div className="modal__content">
        <div className="modal__header">
          <h3>{title} - Trailer</h3>
          <button className="modal__close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal__body">
          <p>Trailer would be embedded here (YouTube/Vimeo iframe)</p>
          <p><strong>Note:</strong> This is a demo - actual trailer integration would require video player.</p>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;