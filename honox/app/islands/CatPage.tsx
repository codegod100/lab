import { useState } from 'hono/jsx'
import Counter from './counter'

const catNames = [
  "Whiskers",
  "Mittens",
  "Shadow",
  "Luna",
  "Simba",
  "Chloe",
  "Oliver",
  "Bella",
  "Leo",
  "Nala"
]

const catQuotes = [
  "Time spent with cats is never wasted.",
  "Cats rule the world. We just live in it.",
  "Home is where the cat is.",
  "In ancient times cats were worshipped as gods; they have not forgotten this.",
  "Cats leave paw prints on your heart."
]

export default function CatPage() {
  const [name, setName] = useState("Hono")
  const [quote, setQuote] = useState(catQuotes[Math.floor(Math.random() * catQuotes.length)])

  function changeName() {
    const newName = catNames[Math.floor(Math.random() * catNames.length)]
    setName(newName)
  }

  return (
    <div class="py-8 text-center space-y-6 bg-yellow-50 min-h-screen">
      <title>Cat Zone</title>
      <h1 class="text-4xl font-bold">🐱 Welcome to the Cat Zone, {name}! 🐾</h1>
      <p class="text-lg italic text-purple-600">{quote}</p>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/320px-Cat03.jpg"
        alt="Adorable cat"
        class="mx-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
      />
      <p class="text-md mt-4">Enjoy your stay with the kitties! 😸</p>
      <Counter onAddCat={changeName} />
    </div>
  )
}