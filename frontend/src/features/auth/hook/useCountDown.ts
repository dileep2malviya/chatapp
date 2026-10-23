import { useEffect, useState } from "react"

export const useCountDown = (targetTime: number | null) => {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!targetTime) return

    let interval: ReturnType<typeof setInterval> | undefined

    const update = () => {
      const remaining = Math.max(
        0,
        Math.ceil((targetTime - Date.now()) / 1000)
      )

      setTimeLeft(remaining)

      if (remaining === 0 && interval) {
        clearInterval(interval)
      }
    }

    update()

    interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [targetTime])

  return timeLeft
};