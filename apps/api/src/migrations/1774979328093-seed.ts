// oxlint-disable no-console
import { categoriesSeed, gamesSeed } from '#MOCK/gamesSeed.js'
import { MigrationInterface, QueryRunner } from 'typeorm'

const usersSeed = [
  {
    username: 'john_doe',
    mail: 'john@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk', // Strongpass1
    is_admin: false,
    is_curator: false
  },
  {
    username: 'jane_smith',
    mail: 'jane@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: true,
    is_curator: true
  },
  {
    username: 'game_master',
    mail: 'master@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: true
  },
  {
    username: 'admin',
    mail: 'admin@admin.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: true,
    is_curator: false
  },
  {
    username: 'casual_gamer',
    mail: 'casual@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
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

// Review templates for random generation
const reviewTitles = [
  'Amazing Game!',
  'Worth Every Penny',
  'Could Be Better',
  'Disappointing Experience',
  'Hidden Gem',
  'Overhyped',
  'Masterpiece',
  'Solid Experience',
  'Not For Everyone',
  'Absolute Must Play',
  'Mediocre at Best',
  'Exceeded Expectations',
  'Technical Mess',
  'Pure Joy',
  'Time Well Spent'
]

const reviewContents = [
  'This game completely blew me away. The attention to detail is incredible.',
  'Had a great time with this one. Would recommend to any fan of the genre.',
  'The gameplay is fun but the story falls flat. Still worth checking out.',
  'Technical issues aside, this is a fantastic experience.',
  'Overrated in my opinion. Expected much more from all the hype.',
  'A hidden gem that more people should know about.',
  'The graphics are stunning but the gameplay gets repetitive.',
  'Absolutely loved every minute of it. Cant wait for more content.',
  'Its okay, nothing special. Play it on sale.',
  'One of the best games I have ever played. Truly remarkable.',
  'Buggy and unfinished. Should have been delayed.',
  'The soundtrack alone makes this worth playing.',
  'Great concepts but poor execution. So much potential wasted.',
  'Finally a game that respects my time and money.',
  'The multiplayer aspect is great but single-player is lacking.'
]

const reviewRatings = [5, 6, 7, 8, 9, 10]

// Helper function to get random items from array
const getRandomItems = <T>(arr: T[], min: number = 1, max: number = 3): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count)
}

// Helper function to get random element
const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate random reviews for each game
const generateRandomReviews = () => {
  const generatedReviews = []
  const allUsernames = usersSeed.map((u) => u.username)
  const allTags = tagsSeed.map((t) => t.name)

  for (const game of gamesSeed) {
    // Each game gets between 2 and 5 random reviews
    const numReviews = Math.floor(Math.random() * 4) + 2 // 2-5 reviews per game

    for (let i = 0; i < numReviews; i++) {
      const randomUsername = getRandomElement(allUsernames)
      const randomTitle = getRandomElement(reviewTitles)
      const randomContent = getRandomElement(reviewContents)
      const randomRating = getRandomElement(reviewRatings)
      const randomTags = getRandomItems(allTags, 1, 3) // 1-3 tags per review

      generatedReviews.push({
        title: randomTitle,
        content: randomContent,
        rating: randomRating,
        game_slug: game.slug,
        username: randomUsername,
        tags: randomTags
      })
    }
  }

  return generatedReviews
}

export class Seed1774979328093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE reviews_tags CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE reviews CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE games_categories CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE games CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE users CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE tags CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE categories CASCADE`)

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
        `INSERT INTO games (name, slug, steam_app_id, description, cover_image, banner_image, screenshots, platforms, developer, released_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING id`,
        [
          game.name,
          game.slug,
          game.steam_app_id,
          game.description,
          game.cover_image,
          game.banner_image,
          game.screenshots,
          game.platforms,
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

    // Regenerate reviews to ensure they match current inserted data
    const finalReviewsSeed = generateRandomReviews()

    // Insert reviews and their tags
    for (const review of finalReviewsSeed) {
      const gameId = insertedGames.get(review.game_slug)
      const userId = insertedUsers.get(review.username)

      if (!gameId || !userId) {
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

    console.log(
      `Seeded ${gamesSeed.length} games with ${finalReviewsSeed.length} total reviews`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all data (simpler than trying to track individual items)
    await queryRunner.query(`TRUNCATE TABLE reviews_tags CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE reviews CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE games_categories CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE games CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE users CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE tags CASCADE`)
    await queryRunner.query(`TRUNCATE TABLE categories CASCADE`)
  }
}
