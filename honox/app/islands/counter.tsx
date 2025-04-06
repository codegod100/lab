import { useState, useEffect, useCallback } from 'hono/jsx'

interface CounterProps {
  onAddCat?: () => void
}

export default function Counter({ onAddCat }: CounterProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [cats, setCats] = useState<{ id: string; top: number; left: number }[]>([])
  const [confetti, setConfetti] = useState<{ id: string; top: number; left: number }[]>([])
  const [isAutoClicking, setIsAutoClicking] = useState(false)
  const [isDancing, setIsDancing] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Use useCallback to prevent re-creating the function on every render,
  // which would cause the useEffect hook to re-run unnecessarily.
  const addCat = useCallback((isManualClick = true) => {
    // Trigger dance animation
    setIsDancing(true)
    setTimeout(() => setIsDancing(false), 1000) // Dance duration

    const newCat = {
      id: `${Date.now()}-${Math.random()}`,
      top: Math.random() * 90,  // percent, avoid edges
      left: Math.random() * 90
    }
    setCats((prevCats) => [...prevCats, newCat])

    // Add confetti burst at the same position
    const confettiId = `${Date.now()}-${Math.random()}`
    setConfetti((prevConfetti) => [...prevConfetti, { id: confettiId, top: newCat.top, left: newCat.left }])

    // Remove confetti after 1 second
    setTimeout(() => {
      setConfetti((prevConfetti) => prevConfetti.filter((c) => c.id !== confettiId))
    }, 1000)

    // Only change name on manual click
    if (isManualClick && onAddCat) {
      onAddCat()
    }

    // Play meow sound
    try {
      const meowSound = new Audio('/sounds/meow.mp3') // Assumes file exists in public/sounds/
      meowSound.play().catch(e => console.error("Error playing sound:", e)); // Handle potential play errors
    } catch (e) {
      console.error("Error creating Audio object:", e)
    }

  }, [onAddCat]) // Dependency array for useCallback

  useEffect(() => {
    let intervalId: number | undefined = undefined
    if (isAutoClicking) {
      intervalId = setInterval(() => {
        addCat(false) // Indicate this is an auto-click
      }, 50) // Add a cat every 500ms
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isAutoClicking, addCat]) // Re-run effect when isAutoClicking or addCat changes

  function toggleAutoClick() {
    setIsAutoClicking(!isAutoClicking)
  }

  return (
    <div>
      <div class="fixed inset-0 pointer-events-none z-40">
        {cats.map((cat) => (
          <img
            key={cat.id}
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/160px-Cat03.jpg"
            alt="Cute cat"
            class={`w-20 h-20 object-cover rounded-lg shadow hover:scale-110 transition-transform duration-300 absolute ${isDancing ? 'dancing' : ''}`}
            style={{ top: `${cat.top}%`, left: `${cat.left}%` }}
          />
        ))}

        {hasMounted && (() => {
          const confettiElements = []
          for (const burst of confetti) {
            for (let idx = 0; idx < 12; idx++) {
              const angle = (idx / 12) * 2 * Math.PI
              const distance = 80 + Math.random() * 40
              const x = Math.cos(angle) * distance
              const y = Math.sin(angle) * distance
              confettiElements.push(
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: safe to use index with unique burst id
                  key={`${burst.id}-${idx}`}
                  class="absolute text-2xl"
                  style={{
                    top: `${burst.top}%`,
                    left: `${burst.left}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: 'explode 1s ease-out forwards',
                    '--x': `${x}px`,
                    '--y': `${y}px`
                  } as Record<string, string>}
                >
                  🐱
                </span>
              )
            }
          }
          return confettiElements
        })()}
      </div>

      <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex space-x-4">
        <button
          type="button"
          class="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full cursor-pointer transition-colors duration-200"
          onClick={() => addCat(true)} // Indicate manual click
        >
          Add a Cat 🐾
        </button>
        <button
          type="button"
          class={`px-4 py-2 rounded-full cursor-pointer transition-colors duration-200 ${
            isAutoClicking
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          onClick={toggleAutoClick}
        >
          {isAutoClicking ? 'Stop Auto 🛑' : 'Start Auto ✨'}
        </button>
      </div>
    </div>
  )
}
