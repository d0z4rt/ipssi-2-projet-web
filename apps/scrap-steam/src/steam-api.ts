// oxlint-disable no-console

// steam-api.ts
export type SteamAppDetails = {
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

export type SteamGameData = {
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

export const getSteamGameData = async (
  appId: string | number
): Promise<SteamGameData> => {
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
