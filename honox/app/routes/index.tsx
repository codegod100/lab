import { createRoute } from 'honox/factory'
import CatPage from '../islands/CatPage'

export default createRoute((c) => {
  const name = c.req.query('name') ?? 'Hono'

  const catQuotes = [
    "Time spent with cats is never wasted.",
    "Cats rule the world. We just live in it.",
    "Home is where the cat is.",
    "In ancient times cats were worshipped as gods; they have not forgotten this.",
    "Cats leave paw prints on your heart."
  ]
  const randomCatQuote = catQuotes[Math.floor(Math.random() * catQuotes.length)]

  return c.render(
    <CatPage />
  )
})
