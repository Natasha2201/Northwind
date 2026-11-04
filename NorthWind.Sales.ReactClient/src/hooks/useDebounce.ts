import { useState, useEffect } from 'react'

/**
 * Hook para retrasar la actualización de un valor hasta que haya transcurrido
 * el tiempo indicado (por defecto 300ms) desde la última modificación.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
