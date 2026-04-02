import { Game } from '#games/game.entity.js'

export const categoriesSeed = [
  'RPG',
  'Action',
  'Adventure',
  'Strategy',
  'Sports'
]

export const gamesSeed: Omit<Game, 'id' | 'created_at' | 'toJSON'>[] = [
  {
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    description: 'A fantasy RPG set in a vast open world.',
    developer: 'CD Projekt Red',
    released_at: new Date('2015-05-18'),
    categories: ['RPG', 'Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/292030/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/292030/ss_1c3a5f4b8e9c2d7a6f4e8b9c2d1a5f4e8b9c2d1a.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/292030/ss_2d4b6f8a0c2e4g6i8k0m2o4q6s8u0w2y4.jpg'
    ],
    platforms: [
      'PC',
      'PS4',
      'PS5',
      'Xbox One',
      'Xbox Series X|S',
      'Nintendo Switch'
    ],
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
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1091500/ss_3e5f7g9i1k3m5o7q9s1u3w5y7a9c1e3g5.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1091500/ss_4f6h8j0l2n4p6r8t0v2x4z6b8d0f2h4j6.jpg'
    ],
    platforms: ['PC', 'PS5', 'Xbox Series X|S', 'PS4', 'Xbox One'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    description: 'A deep RPG based on D&D 5th edition rules.',
    developer: 'Larian Studios',
    released_at: new Date('2023-08-03'),
    categories: ['RPG', 'Strategy'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1086940/ss_5g7i9k1m3o5q7s9u1w3y5a7c9e1g3i5k7.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1086940/ss_6h8j0l2n4p6r8t0v2x4z6b8d0f2h4j6l8.jpg'
    ],
    platforms: ['PC', 'PS5', 'Xbox Series X|S'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Elden Ring',
    slug: 'elden-ring',
    description: 'A challenging open-world action RPG from FromSoftware.',
    developer: 'FromSoftware',
    released_at: new Date('2022-02-25'),
    categories: ['RPG', 'Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1245620/ss_7i9k1m3o5q7s9u1w3y5a7c9e1g3i5k7m9o.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1245620/ss_8j0l2n4p6r8t0v2x4z6b8d0f2h4j6l8n0p2.jpg'
    ],
    platforms: ['PC', 'PS4', 'PS5', 'Xbox One', 'Xbox Series X|S'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'God of War',
    slug: 'god-of-war',
    description: 'Epic Norse mythology action-adventure game.',
    developer: 'Santa Monica Studio',
    released_at: new Date('2022-01-14'),
    categories: ['Action', 'Adventure'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1593500/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1593500/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1593500/ss_9k1m3o5q7s9u1w3y5a7c9e1g3i5k7m9o1q3.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1593500/ss_0l2n4p6r8t0v2x4z6b8d0f2h4j6l8n0p2r4t6.jpg'
    ],
    platforms: ['PC', 'PS4', 'PS5'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    description: 'Immersive Western open-world masterpiece.',
    developer: 'Rockstar Games',
    released_at: new Date('2019-12-05'),
    categories: ['Action', 'Adventure'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1174180/ss_1m3o5q7s9u1w3y5a7c9e1g3i5k7m9o1q3s5u7.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1174180/ss_2n4p6r8t0v2x4z6b8d0f2h4j6l8n0p2r4t6v8.jpg'
    ],
    platforms: ['PC', 'PS4', 'Xbox One', 'Stadia'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Starfield',
    slug: 'starfield',
    description: "Bethesda's epic space-faring RPG across the galaxy.",
    developer: 'Bethesda Game Studios',
    released_at: new Date('2023-09-06'),
    categories: ['RPG', 'Adventure'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1716740/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/1716740/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/1716740/ss_3o5q7s9u1w3y5a7c9e1g3i5k7m9o1q3s5u7w9.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/1716740/ss_4p6r8t0v2x4z6b8d0f2h4j6l8n0p2r4t6v8x0z.jpg'
    ],
    platforms: ['PC', 'Xbox Series X|S'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Hogwarts Legacy',
    slug: 'hogwarts-legacy',
    description: 'Open-world action RPG set in the Wizarding World.',
    developer: 'Avalanche Software',
    released_at: new Date('2023-02-10'),
    categories: ['RPG', 'Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/990080/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/990080/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/990080/ss_5q7s9u1w3y5a7c9e1g3i5k7m9o1q3s5u7w9y1a.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/990080/ss_6r8t0v2x4z6b8d0f2h4j6l8n0p2r4t6v8x0z2b4.jpg'
    ],
    platforms: [
      'PC',
      'PS5',
      'PS4',
      'Xbox Series X|S',
      'Xbox One',
      'Nintendo Switch'
    ],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Counter-Strike 2',
    slug: 'counter-strike-2',
    description: 'The next generation of competitive tactical shooter.',
    developer: 'Valve',
    released_at: new Date('2023-09-27'),
    categories: ['Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/730/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/730/ss_7s9u1w3y5a7c9e1g3i5k7m9o1q3s5u7w9y1a3c5.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/730/ss_8t0v2x4z6b8d0f2h4j6l8n0p2r4t6v8x0z2b4d6f8.jpg'
    ],
    platforms: ['PC'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Dota 2',
    slug: 'dota-2',
    description: 'The most popular MOBA game.',
    developer: 'Valve',
    released_at: new Date('2013-07-09'),
    categories: ['Strategy', 'Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/570/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/570/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_9u1w3y5a7c9e1g3i5k7m9o1q3s5u7w9y1a3c5e7.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/570/ss_0v2x4z6b8d0f2h4j6l8n0p2r4t6v8x0z2b4d6f8h0.jpg'
    ],
    platforms: ['PC', 'Mac', 'Linux'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Monster Hunter: World',
    slug: 'monster-hunter-world',
    description: 'Hunt gigantic monsters in a living ecosystem.',
    developer: 'Capcom',
    released_at: new Date('2018-08-09'),
    categories: ['RPG', 'Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/582010/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/582010/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/582010/ss_1w3y5a7c9e1g3i5k7m9o1q3s5u7w9y1a3c5e7g9.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/582010/ss_2x4z6b8d0f2h4j6l8n0p2r4t6v8x0z2b4d6f8h0j2.jpg'
    ],
    platforms: ['PC', 'PS4', 'Xbox One'],
    games_to_categories: null,
    reviews: null
  },
  {
    name: 'Sekiro: Shadows Die Twice',
    slug: 'sekiro-shadows-die-twice',
    description: 'Intense samurai action from FromSoftware.',
    developer: 'FromSoftware',
    released_at: new Date('2019-03-22'),
    categories: ['Action'],
    cover_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/814380/library_600x900_2x.jpg',
    banner_image:
      'https://steamcdn-a.akamaihd.net/steam/apps/814380/library_hero.jpg',
    screenshots: [
      'https://steamcdn-a.akamaihd.net/steam/apps/814380/ss_3y5a7c9e1g3i5k7m9o1q3s5u7w9y1a3c5e7g9i1.jpg',
      'https://steamcdn-a.akamaihd.net/steam/apps/814380/ss_4z6b8d0f2h4j6l8n0p2r4t6v8x0z2b4d6f8h0j2l4.jpg'
    ],
    platforms: ['PC', 'PS4', 'Xbox One', 'Stadia'],
    games_to_categories: null,
    reviews: null
  }
]
