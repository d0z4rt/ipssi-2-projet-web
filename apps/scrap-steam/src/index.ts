// oxlint-disable no-console

import fs from 'node:fs/promises'

// steam-api.ts
interface SteamAppDetails {
  [appId: string]: {
    success: boolean
    data: {
      name: string
      short_description: string
      developers: string[]
      publishers: string[]
      release_date: { date: string; coming_soon: boolean }
      genres: { id: string; description: string }[]
      header_image: string
      screenshots: { id: number; path_thumbnail: string; path_full: string }[]
      platforms: { windows: boolean; mac: boolean; linux: boolean }
      categories: { id: string; description: string }[]
    }
  }
}

interface SteamGameData {
  name: string
  slug: string
  description: string
  developer: string
  released_at: Date | null
  categories: string[]
  cover_image: string
  banner_image: string
  screenshots: string[]
  platforms: string[]
}

async function getSteamGameData(
  appId: string | number
): Promise<SteamGameData> {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`

  try {
    const response = await fetch(url)
    const data: SteamAppDetails = (await response.json()) as SteamAppDetails

    if (!data[appId]?.success) {
      throw new Error(`Failed to fetch data for app ${appId}`)
    }

    const game = data[appId].data

    // Generate slug from name
    const slug = game.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    // Parse release date
    let released_at: Date | null = null
    if (game.release_date?.date && !game.release_date.coming_soon) {
      released_at = new Date(game.release_date.date)
    }

    // Get categories/genres
    const categories = game.genres?.map((g) => g.description) || []

    // Get cover image (use header_image)
    const cover_image = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900_2x.jpg`

    // Banner image (use the same or a larger version)
    const banner_image = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/library_hero.jpg`

    // Get screenshots
    const screenshots = game.screenshots?.map((s) => s.path_full) || []

    // Get platforms
    const platforms: string[] = []
    if (game.platforms?.windows) platforms.push('PC')
    if (game.platforms?.mac) platforms.push('Mac')
    if (game.platforms?.linux) platforms.push('Linux')

    // If no platforms found, try to infer from categories or default to ['PC']
    if (platforms.length === 0) {
      platforms.push('PC')
    }

    return {
      name: game.name,
      slug,
      description: game.short_description || 'No description available',
      developer:
        game.developers?.[0] || game.publishers?.[0] || 'Unknown Developer',
      released_at,
      categories,
      cover_image,
      banner_image,
      screenshots,
      platforms
    }
  } catch (error) {
    console.error(`Error fetching game ${appId}:`, error)
    return {
      name: '',
      slug: '',
      description: '',
      developer: '',
      released_at: null,
      categories: [],
      cover_image: '',
      banner_image: '',
      screenshots: [],
      platforms: []
    }
  }
}

// List of popular game App IDs
const POPULAR_GAMES = [
  { id: 292030, name: 'The Witcher 3' },
  { id: 1091500, name: 'Cyberpunk 2077' },
  { id: 1086940, name: "Baldur's Gate 3" },
  { id: 1245620, name: 'Elden Ring' },
  { id: 1593500, name: 'God of War' },
  { id: 1174180, name: 'Red Dead Redemption 2' },
  { id: 1716740, name: 'Starfield' },
  { id: 990080, name: 'Hogwarts Legacy' },
  { id: 730, name: 'Counter-Strike 2' },
  { id: 570, name: 'Dota 2' },
  { id: 582010, name: 'Monster Hunter: World' },
  { id: 814380, name: 'Sekiro: Shadows Die Twice' }
]

async function generateAllGames() {
  const games = []

  for (const game of POPULAR_GAMES) {
    console.log(`Fetching ${game.name} (${game.id})...`)
    const gameData = await getSteamGameData(game.id)
    if (gameData.name) {
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

main().catch(console.error)

export { getSteamGameData, type SteamGameData }
