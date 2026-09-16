import './ITSTable.css'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return iso
  }
}

export default function ITSTable({ records, onToggle, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="its-table__empty">
        <p>No ITS numbers yet.</p>
        <span>Add one to get started — it will appear here immediately.</span>
      </div>
    )
  }

  return (
    <div className="its-table">
      <div className="its-table__row its-table__row--head" role="row">
        <span>ITS</span>
        <span>Status</span>
        <span>Added</span>
        <span className="its-table__actions-head">Actions</span>
      </div>
      {records.map((record) => (
        <div className="its-table__row" role="row" key={record.id}>
          <span className="its-table__its">{record.its}</span>
          <span>
            <span className={`badge ${record.active ? 'badge--ok' : 'badge--off'}`}>
              {record.active ? 'Active' : 'Disabled'}
            </span>
            {record.activeSession && (
              <span className="badge badge--session" title="Currently signed in">
                Signed in
              </span>
            )}
          </span>
          <span className="its-table__date">{formatDate(record.createdAt)}</span>
          <span className="its-table__actions">
            <button type="button" className="its-table__btn" onClick={() => onToggle(record)}>
              {record.active ? 'Disable' : 'Enable'}
            </button>
            <button
              type="button"
              className="its-table__btn its-table__btn--danger"
              onClick={() => onDelete(record)}
            >
              Delete
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}
