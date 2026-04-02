import { Game } from '#games/game.entity.js'
import { MigrationInterface, QueryRunner } from 'typeorm'

const gamesSeed: Omit<Game, 'id' | 'created_at' | 'toJSON'>[] = [
  {
    name: 'The Witcher 3',
    slug: 'the-witcher-3',
    description: 'A fantasy RPG set in a vast open world.',
    developer: 'CD Projekt Red',
    released_at: new Date('2015-05-18'),
    categories: ['RPG', 'Action'],
    cover_image: null,
    banner_image: null,
    screenshots: null,
    platforms: null,
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    description: 'An open-world action RPG set in a futuristic metropolis.',
    developer: 'CD Projekt Red',
    released_at: new Date('2020-12-10'),
    categories: ['RPG', 'Action'],
    cover_image: null,
    banner_image: null,
    screenshots: null,
    platforms: null,
    games_to_categories: null,
    reviews: null
  },
  {
    name: "Baldur's Gate 3",
    slug: 'baldur-s-gate-3',
    description: 'A deep RPG based on D&D 5th edition rules.',
    developer: 'Larian Studios',
    released_at: new Date('2023-08-03'),
    categories: ['RPG', 'Strategy'],
    cover_image: null,
    banner_image: null,
    screenshots: null,
    platforms: null,
    games_to_categories: null,
    reviews: null
  }
]

const categoriesSeed = ['RPG', 'Action', 'Adventure', 'Strategy', 'Sports']

const usersSeed = [
  {
    username: 'john_doe',
    mail: 'john@example.com',
    password: '$2b$10$hashed_password_here',
    is_admin: false,
    is_curator: false
  },
  {
    username: 'jane_smith',
    mail: 'jane@example.com',
    password: '$2b$10$hashed_password_here',
    is_admin: true,
    is_curator: true
  },
  {
    username: 'game_master',
    mail: 'master@example.com',
    password: '$2b$10$hashed_password_here',
    is_admin: false,
    is_curator: true
  },
  {
    username: 'casual_gamer',
    mail: 'casual@example.com',
    password: '$2b$10$hashed_password_here',
    is_admin: false,
    is_curator: false
  }
]

const tagsSeed = [
  { name: 'Masterpiece' },
  { name: 'Great Story' },
  { name: 'Beautiful Graphics' },
  { name: 'Buggy' },
  { name: 'Overrated' },
  { name: 'Must Play' },
  { name: 'Disappointing' },
  { name: 'Excellent Combat' }
]

const reviewsSeed = [
  {
    title: 'A True Masterpiece',
    content:
      'One of the best RPGs ever made. The story, characters, and world-building are exceptional.',
    rating: 10,
    game_slug: 'the-witcher-3',
    username: 'john_doe',
    tags: ['Masterpiece', 'Great Story', 'Excellent Combat']
  },
  {
    title: 'Great Game, Some Issues',
    content: 'The game is amazing but had some technical problems at launch.',
    rating: 8,
    game_slug: 'cyberpunk-2077',
    username: 'jane_smith',
    tags: ['Beautiful Graphics', 'Buggy']
  },
  {
    title: 'Best RPG of the Decade',
    content:
      "Baldur's Gate 3 sets a new standard for RPGs. Incredible freedom and depth.",
    rating: 10,
    game_slug: 'baldur-s-gate-3',
    username: 'game_master',
    tags: ['Masterpiece', 'Must Play']
  },
  {
    title: 'Overhyped but Still Good',
    content: "Enjoyed my time with it, but didn't live up to the expectations.",
    rating: 7,
    game_slug: 'cyberpunk-2077',
    username: 'casual_gamer',
    tags: ['Overrated', 'Beautiful Graphics']
  },
  {
    title: 'Incredible Storytelling',
    content:
      'The writing and characters are phenomenal. A must-play for any RPG fan.',
    rating: 9,
    game_slug: 'the-witcher-3',
    username: 'game_master',
    tags: ['Great Story', 'Must Play']
  },
  {
    title: 'Disappointing Launch',
    content: 'The game was released too early. Should have been delayed.',
    rating: 6,
    game_slug: 'cyberpunk-2077',
    username: 'john_doe',
    tags: ['Disappointing', 'Buggy']
  }
]

export class Seed1774979328093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert categories
    for (const categoryName of categoriesSeed) {
      await queryRunner.query(
        `INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
        [categoryName]
      )
    }

    // Get all categories for reference
    const categories = await queryRunner.query(
      `SELECT id, name FROM categories`
    )

    // Insert games and their categories
    const insertedGames = new Map()
    for (const game of gamesSeed) {
      const result = await queryRunner.query(
        `INSERT INTO games (name, slug, description, developer, released_at, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [
          game.name,
          game.slug,
          game.description,
          game.developer,
          game.released_at
        ]
      )

      const gameId = result[0].id
      insertedGames.set(game.slug, gameId)

      // Associate categories
      for (const categoryName of game.categories) {
        const category = categories.find((c: any) => c.name === categoryName)
        if (category) {
          await queryRunner.query(
            `INSERT INTO games_categories (game_id, category_id, created_at) VALUES ($1, $2, NOW())`,
            [gameId, category.id]
          )
        }
      }
    }

    // Insert users
    const insertedUsers = new Map()
    for (const user of usersSeed) {
      const result = await queryRunner.query(
        `INSERT INTO users (username, mail, password, is_admin, is_curator, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [
          user.username,
          user.mail,
          user.password,
          user.is_admin,
          user.is_curator
        ]
      )
      insertedUsers.set(user.username, result[0].id)
    }

    // Insert tags
    const insertedTags = new Map()
    for (const tag of tagsSeed) {
      const result = await queryRunner.query(
        `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
        [tag.name]
      )
      insertedTags.set(tag.name, result[0].id)
    }

    // Insert reviews and their tags
    for (const review of reviewsSeed) {
      const gameId = insertedGames.get(review.game_slug)
      const userId = insertedUsers.get(review.username)

      if (!gameId || !userId) {
        // oxlint-disable-next-line no-console
        console.warn(`Skipping review "${review.title}" - missing game or user`)
        continue
      }

      const result = await queryRunner.query(
        `INSERT INTO reviews (title, content, rating, user_id, game_id, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [review.title, review.content, review.rating, userId, gameId]
      )

      const reviewId = result[0].id

      // Associate tags with review
      for (const tagName of review.tags) {
        const tagId = insertedTags.get(tagName)
        if (tagId) {
          await queryRunner.query(
            `INSERT INTO reviews_tags (review_id, tag_id, created_at)
             VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
            [reviewId, tagId]
          )
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete reviews_tags associations
    const reviewsToDelete = reviewsSeed.map((r) => `'${r.title}'`).join(', ')
    await queryRunner.query(`
      DELETE FROM reviews_tags
      WHERE review_id IN (
        SELECT id FROM reviews WHERE title IN (${reviewsToDelete})
      )
    `)

    // Delete reviews
    await queryRunner.query(`
      DELETE FROM reviews WHERE title IN (${reviewsToDelete})
    `)

    // Delete users
    const usersToDelete = usersSeed.map((u) => `'${u.username}'`).join(', ')
    await queryRunner.query(`
      DELETE FROM users WHERE username IN (${usersToDelete})
    `)

    // Delete tags
    const tagsToDelete = tagsSeed.map((t) => `'${t.name}'`).join(', ')
    await queryRunner.query(`
      DELETE FROM tags WHERE name IN (${tagsToDelete})
    `)

    // Delete games_categories associations
    const gamesToDelete = gamesSeed.map((g) => `'${g.name}'`).join(', ')
    await queryRunner.query(`
      DELETE FROM games_categories
      WHERE game_id IN (
        SELECT id FROM games WHERE name IN (${gamesToDelete})
      )
    `)

    // Delete games
    await queryRunner.query(`
      DELETE FROM games WHERE name IN (${gamesToDelete})
    `)

    // Delete categories
    await queryRunner.query(`
      DELETE FROM categories WHERE name IN (${categoriesSeed.map((c) => `'${c}'`).join(', ')})
    `)
  }
}
