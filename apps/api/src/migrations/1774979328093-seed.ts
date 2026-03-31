import { Game } from '#games/game.entity.js'
import { MigrationInterface, QueryRunner } from 'typeorm'

export const gamesSeed: Omit<Game, 'id' | 'created_at' | 'toJSON'>[] = [
  {
    name: 'The Witcher 3',
    slug: 'the-witcher-3',
    description: 'A fantasy RPG set in a vast open world.',
    developer: 'CD Projekt Red',
    released_at: new Date('2015-05-18'),
    categories: ['RPG', 'Action']
  },
  {
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    description: 'An open-world action RPG set in a futuristic metropolis.',
    developer: 'CD Projekt Red',
    released_at: new Date('2020-12-10'),
    categories: ['RPG', 'Action']
  },
  {
    name: "Baldur's Gate 3",
    slug: 'baldur-s-gate-3',
    description: 'A deep RPG based on D&D 5th edition rules.',
    developer: 'Larian Studios',
    released_at: new Date('2023-08-03'),
    categories: ['RPG', 'Strategy']
  }
]

export const categoriesSeed = [
  'RPG',
  'Action',
  'Adventure',
  'Strategy',
  'Sports'
]

export class Seed1774979328093 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

      // Associate categories
      for (const categoryName of game.categories) {
        const category = categories.find((c: any) => c.name === categoryName)
        if (category) {
          await queryRunner.query(
            `INSERT INTO games_categories (game_id, game_slug, category_id, created_at) VALUES ($1, $2, $3, NOW())`,
            [gameId, game.slug, category.id]
          )
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete associations
    await queryRunner.query(`
        DELETE FROM games_categories
        WHERE game_id IN (
          SELECT id FROM games WHERE name IN (${gamesSeed.map((g) => `'${g.name}'`).join(', ')})
        )
      `)

    // Delete games
    await queryRunner.query(`
        DELETE FROM games WHERE name IN (${gamesSeed.map((g) => `'${g.name}'`).join(', ')})
      `)

    // Delete categories (if you want to clean them up)
    await queryRunner.query(`
        DELETE FROM categories WHERE name IN (${categoriesSeed.map((c) => `'${c}'`).join(', ')})
      `)
  }
}
