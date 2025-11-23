import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, opts = {}) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 8)
    const t = { id, msg, type: opts.type || 'success', ttl: opts.ttl || 4000 }
    setToasts(s => [...s, t])
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), t.ttl)
  }, [])

  const value = { push }

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item ${t.type === 'error' ? 'toast-error' : 'toast-success'}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
