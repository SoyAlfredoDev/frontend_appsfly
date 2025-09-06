export default function CheckForm({ label, id, checked, onChange }) {
    return (
        <div className="form-check">
            <input
                className="form-check-input"
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <label className="form-check-label" htmlFor={id}>
                {label}
            </label>
        </div>
    );
}
