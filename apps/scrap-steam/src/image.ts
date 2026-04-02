// oxlint-disable no-console
import { SteamGameData } from '#steam-api.js'
import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'

const getCleanFilename = (url: string, defaultExt: string = '.jpg'): string => {
  // Remove query parameters
  const urlWithoutParams = url.split('?')[0]
  // Get the base filename from the URL
  let filename = path.basename(urlWithoutParams)

  // If filename has no extension, add the default one
  if (!path.extname(filename)) {
    filename += defaultExt
  }

  // Remove any invalid characters for filenames
  filename = filename.replace(/[<>:"/\\|?*]/g, '_')

  return filename
}

export const downloadImage = async (
  url: string,
  filepath: string
): Promise<boolean> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(filepath)
    await fs.mkdir(dir, { recursive: true })

    // Use pipeline for efficient streaming
    const fileStream = createWriteStream(filepath)
    await pipeline(response.body!, fileStream)

    console.log(`  ✓ Downloaded: ${path.basename(filepath)}`)
    return true
  } catch (error) {
    console.error(`  ✗ Failed to download ${url}:`, error)
    return false
  }
}

export const downloadGameImages = async (
  appId: number | string,
  gameData: SteamGameData
): Promise<SteamGameData> => {
  const imageDir = `./images/${appId}`
  const updatedGameData = { ...gameData }

  console.log(
    `\n📸 Downloading images for ${gameData.name} (${appId}) to ${imageDir}/`
  )

  // Download cover image and update path
  if (gameData.cover_image) {
    const filename = getCleanFilename(gameData.cover_image)
    const coverPath = path.join(imageDir, filename)
    const success = await downloadImage(gameData.cover_image, coverPath)
    if (success) {
      updatedGameData.cover_image = coverPath
    }
  }

  // Download banner image and update path
  if (gameData.banner_image) {
    const filename = getCleanFilename(gameData.banner_image)
    const bannerPath = path.join(imageDir, filename)
    const success = await downloadImage(gameData.banner_image, bannerPath)
    if (success) {
      updatedGameData.banner_image = bannerPath
    }
  }

  // Download screenshots and update paths
  if (gameData.screenshots.length > 0) {
    const screenshotsDir = path.join(imageDir, 'screenshots')
    const updatedScreenshots: string[] = []

    for (let i = 0; i < gameData.screenshots.length; i++) {
      const screenshotUrl = gameData.screenshots[i]
      const cleanFilename = getCleanFilename(screenshotUrl)
      let ext = path.extname(cleanFilename)
      // Use sequential numbering for filename
      const filename = `screenshot_${i}${ext}`
      const screenshotPath = path.join(screenshotsDir, filename)
      const success = await downloadImage(screenshotUrl, screenshotPath)
      if (success) {
        updatedScreenshots.push(screenshotPath)
      } else {
        // Keep original URL if download fails
        updatedScreenshots.push(screenshotUrl)
      }
    }

    updatedGameData.screenshots = updatedScreenshots
  }

  return updatedGameData
}
