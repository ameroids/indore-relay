import './ITSInput.css'
import { sanitizeITSInput } from '../utils/validators'

export default function ITSInput({ id = 'its', label = 'ITS number', value, onChange, autoFocus, error }) {
  const handleChange = (event) => {
    onChange(sanitizeITSInput(event.target.value))
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text')
    onChange(sanitizeITSInput(pasted))
  }

  return (
    <label className="its-input" htmlFor={id}>
      <span className="its-input__label">{label}</span>
      <input
        id={id}
        name="its"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder="00000000"
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        maxLength={8}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="its-input__field"
      />
      <span className="its-input__meter" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className={`its-input__dot ${i < value.length ? 'is-filled' : ''}`} />
        ))}
      </span>
    </label>
  )
}
