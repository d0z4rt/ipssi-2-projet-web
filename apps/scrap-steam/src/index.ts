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
  steam_app_id: number
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
      steam_app_id: Number(appId),
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
      steam_app_id: 0,
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
  // Action RPGs
  { id: 292030, name: 'The Witcher 3: Wild Hunt' },
  { id: 1091500, name: 'Cyberpunk 2077' },
  { id: 1086940, name: "Baldur's Gate 3" },
  { id: 1245620, name: 'Elden Ring' },
  { id: 1593500, name: 'God of War' },
  { id: 1174180, name: 'Red Dead Redemption 2' },
  { id: 1716740, name: 'Starfield' },
  { id: 990080, name: 'Hogwarts Legacy' },
  { id: 582010, name: 'Monster Hunter: World' },
  { id: 814380, name: 'Sekiro: Shadows Die Twice' },

  // Classic RPGs
  { id: 435150, name: 'Divinity: Original Sin 2' },
  { id: 524220, name: 'NieR: Automata' },
  { id: 1325200, name: 'Nioh 2' },
  { id: 2344520, name: 'Diablo IV' },
  { id: 359550, name: "Tom Clancy's Rainbow Six Siege" },
  { id: 20920, name: 'The Witcher 2: Assassins of Kings' },
  { id: 22380, name: 'Fallout: New Vegas' },
  { id: 377160, name: 'Fallout 4' },
  { id: 489830, name: 'The Elder Scrolls V: Skyrim Special Edition' },
  { id: 1790600, name: 'DRAGON BALL: Sparking! ZERO' },

  // Shooters
  { id: 730, name: 'Counter-Strike 2' },
  { id: 570, name: 'Dota 2' },
  { id: 440, name: 'Team Fortress 2' },
  { id: 2767030, name: 'Marvel Rivals' },
  { id: 3097560, name: "Liar's Bar" },
  { id: 671860, name: 'BattleBit Remastered' },
  { id: 1085660, name: 'Destiny 2' },
  { id: 230410, name: 'Warframe' },
  { id: 2923300, name: 'Banana' },
  { id: 1172470, name: 'Apex Legends' },
  { id: 1985810, name: 'Call of Duty: Black Ops Cold War' },

  // Strategy & Simulation
  { id: 289070, name: "Sid Meier's Civilization VI" },
  { id: 227300, name: 'Euro Truck Simulator 2' },
  { id: 3240220, name: 'Grand Theft Auto V Enhanced' },
  { id: 3077390, name: 'MotoGP 25' },

  // Indie Hits
  { id: 105600, name: 'Terraria' },
  { id: 413150, name: 'Stardew Valley' },
  { id: 367520, name: 'Hollow Knight' },
  { id: 588650, name: 'Dead Cells' },
  { id: 504230, name: 'Celeste' },

  // Recent Hits (2023-2025)
  { id: 2073850, name: 'THE FINALS' },
  { id: 1599340, name: 'Lost Ark' },
  { id: 1332010, name: 'Stray' },
  { id: 1198970, name: 'I Am Jesus Christ' },

  // Horror
  { id: 47780, name: 'Dead Space 2' },
  { id: 381210, name: 'Dead by Daylight' }
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
