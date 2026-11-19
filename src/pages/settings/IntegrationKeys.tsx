import { useCallback, useEffect, useState, type FormEvent } from 'react'
import api from '../../api/axios.js'

const permissions = [
  ['customers:write', 'Registrar clientes'],
  ['sales:write', 'Registrar ventas'],
  ['payments:write', 'Registrar abonos'],
] as const

type Key = {
  id: string
  name: string
  scopes: string[]
  lastUsedAt: string | null
  revokedAt: string | null
}

export default function IntegrationKeys() {
  const [keys, setKeys] = useState<Key[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [secret, setSecret] = useState('')
  const [confirm, setConfirm] = useState<string | null>(null)

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get<{ keys: Key[] }>('/integration-keys', { signal })
      if (!signal?.aborted) setKeys(data.keys)
    } catch {
      if (!signal?.aborted) setError('No se pudieron cargar las llaves. Vuelve a intentar.')
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSecret('')
    try {
      const { data } = await api.post<{ key: Key; secret: string }>('/integration-keys', {
        name,
        scopes: selected,
      })
      setKeys((current) => [data.key, ...current])
      setSecret(data.secret)
      setName('')
      setSelected([])
    } catch {
      setError('No se pudo crear la llave. Revisa el nombre y los permisos.')
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string) {
    setBusy(true)
    setError('')
    try {
      await api.delete(`/integration-keys/${id}`)
      setKeys((current) =>
        current.map((key) =>
          key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key,
        ),
      )
      setConfirm(null)
      setSecret('')
    } catch {
      setError('No se pudo revocar la llave.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card space-y-4 p-6" aria-labelledby="integration-keys-heading">
      <h2 id="integration-keys-heading" className="text-lg font-semibold">
        Llaves de integración
      </h2>
      <p>Conecta otro sistema para registrar clientes, ventas y abonos en este negocio.</p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Cargando llaves…</p>
      ) : (
        <>
          <button type="button" className="btn btn-secondary" onClick={() => void load()}>
            Actualizar llaves
          </button>
          {keys.length === 0 && !error && <p>Este negocio todavía no tiene llaves.</p>}
          <ul className="space-y-3">
            {keys.map((key) => (
              <li key={key.id} className="rounded-lg border p-3">
                <p className="font-semibold">
                  {key.name} · {key.revokedAt ? 'Revocada' : 'Activa'}
                </p>
                <p>
                  {permissions
                    .filter(([value]) => key.scopes.includes(value))
                    .map(([, label]) => label)
                    .join(' · ')}
                </p>
                <p>
                  {key.lastUsedAt
                    ? `Último uso: ${new Date(key.lastUsedAt).toLocaleString('es-CL')}`
                    : 'Sin uso registrado'}
                </p>
                {!key.revokedAt &&
                  (confirm === key.id ? (
                    <div className="flex flex-wrap gap-3">
                      <button type="button" disabled={busy} onClick={() => void revoke(key.id)}>
                        Confirmar revocación
                      </button>
                      <button type="button" disabled={busy} onClick={() => setConfirm(null)}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => setConfirm(key.id)}>
                      Revocar {key.name}
                    </button>
                  ))}
              </li>
            ))}
          </ul>
        </>
      )}
      <form className="space-y-3" onSubmit={(event) => void create(event)}>
        <label className="block">
          Nombre de la integración
          <input
            className="block rounded border p-2"
            required
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <fieldset className="space-y-1">
          <legend>Permisos</legend>
          {permissions.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={({ target }) =>
                  setSelected((current) =>
                    target.checked ? [...current, value] : current.filter((item) => item !== value),
                  )
                }
              />
              {label}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || busy || !name.trim() || !selected.length}
        >
          Crear llave
        </button>
      </form>
      {secret && (
        <div className="space-y-2" role="status">
          <p>Guarda la llave en el servidor del sistema externo. Se muestra una sola vez.</p>
          <input
            className="w-full rounded border p-2 font-mono"
            aria-label="Llave generada"
            readOnly
            value={secret}
            onFocus={(event) => event.target.select()}
          />
          <button type="button" onClick={() => setSecret('')}>
            Ocultar llave
          </button>
        </div>
      )}
    </section>
  )
}
