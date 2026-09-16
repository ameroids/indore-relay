import { useEffect, useMemo, useState } from 'react'
import './AdminDashboardPage.css'
import StatCard from '../components/StatCard'
import ITSTable from '../components/ITSTable'
import Modal from '../components/Modal'
import Alert from '../components/Alert'
import { itsService } from '../services/itsService'
import { validateITS } from '../utils/validators'

export default function AdminDashboardPage() {
  const [records, setRecords] = useState([])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newITS, setNewITS] = useState('')
  const [addError, setAddError] = useState(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const refresh = async () => {
    const list = await itsService.list()
    setRecords(list)
  }

  useEffect(() => {
    refresh()
  }, [])

  const stats = useMemo(() => {
    const total = records.length
    const active = records.filter((r) => r.active).length
    return { total, active, disabled: total - active }
  }, [records])

  const filtered = useMemo(() => {
    if (!query.trim()) return records
    return records.filter((r) => r.its.includes(query.trim()))
  }, [records, query])

  const handleAdd = async (event) => {
    event.preventDefault()
    const result = validateITS(newITS)
    if (!result.valid) {
      setAddError(result.error)
      return
    }
    setAdding(true)
    setAddError(null)
    try {
      await itsService.add(result.value)
      setNewITS('')
      setModalOpen(false)
      await refresh()
    } catch (err) {
      setAddError(err.message)
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (record) => {
    await itsService.setActive(record.id, !record.active)
    await refresh()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    await itsService.remove(confirmDelete.id)
    setConfirmDelete(null)
    await refresh()
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__head">
        <div>
          <h1>Authorized access</h1>
          <p>Manage which ITS numbers can sign in to Indore Relay.</p>
        </div>
        <button type="button" className="admin-dashboard__add" onClick={() => setModalOpen(true)}>
          + Add ITS
        </button>
      </div>

      <div className="admin-dashboard__stats">
        <StatCard label="Total ITS" value={stats.total} tone="accent" />
        <StatCard label="Active" value={stats.active} tone="active" />
        <StatCard label="Disabled" value={stats.disabled} tone="disabled" />
      </div>

      <div className="admin-dashboard__toolbar">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Search by ITS number"
          value={query}
          onChange={(e) => setQuery(e.target.value.replace(/\D/g, '').slice(0, 8))}
          className="admin-dashboard__search"
        />
      </div>

      <ITSTable records={filtered} onToggle={handleToggle} onDelete={setConfirmDelete} />

      <Modal open={modalOpen} title="Add ITS number" onClose={() => setModalOpen(false)}>
        <form className="add-its-form" onSubmit={handleAdd}>
          <label className="add-its-form__field">
            <span>8-digit ITS</span>
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={newITS}
              onChange={(e) => setNewITS(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="00000000"
            />
          </label>
          <Alert tone="error">{addError}</Alert>
          <button type="submit" className="add-its-form__submit" disabled={adding}>
            {adding ? 'Adding…' : 'Add ITS'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        title="Delete this ITS?"
        onClose={() => setConfirmDelete(null)}
      >
        <div className="confirm-delete">
          <p>
            ITS <strong>{confirmDelete?.its}</strong> will lose access immediately, and any active
            session for it will be signed out. This can't be undone.
          </p>
          <div className="confirm-delete__actions">
            <button type="button" className="confirm-delete__cancel" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button type="button" className="confirm-delete__confirm" onClick={handleDelete}>
              Delete ITS
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
