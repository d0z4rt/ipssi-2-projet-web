// oxlint-disable no-console

import { POPULAR_GAMES } from '#game-list.js'
import { downloadGameImages } from '#image.js'
import { getSteamGameData } from '#steam-api.js'
import fs from 'node:fs/promises'

async function generateAllGames(downloadImages: boolean = true) {
  const games = []

  for (const game of POPULAR_GAMES) {
    console.log(`Fetching ${game.name} (${game.id})...`)
    let gameData = await getSteamGameData(game.id)
    if (gameData.name) {
      if (downloadImages) {
        gameData = await downloadGameImages(game.id, gameData)
      }
      games.push(gameData)
      console.log(`✓ Successfully fetched ${gameData.name}`)
    } else {
      console.log(`✗ Failed to fetch ${game.name}`)
    }

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return games
}

// Generate and save to file
async function main() {
  const games = await generateAllGames()

  // Create the gamesSeed array with the required structure
  const gamesSeed = games.map((game) => ({
    ...game,
    games_to_categories: null,
    reviews: null
  }))

  // Output as TypeScript file
  const output = `// Auto-generated from Steam API
export const gamesSeed = ${JSON.stringify(gamesSeed, null, 2)} as const

export const categoriesSeed = Array.from(new Set(gamesSeed.flatMap(g => g.categories)))
`

  await fs.writeFile('./gamesSeed-generated.ts', output)

  console.log(`\n✅ Generated ${games.length} games to gamesSeed-generated.ts`)
  console.log(
    `📁 Categories: ${Array.from(new Set(games.flatMap((g) => g.categories))).join(', ')}`
  )
}

await main().catch(console.error)
