import axios from 'axios'

// Create Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Types
export interface Game {
  id: string
  title: string
  description: string
  genre: string
  platform: string[]
  rating: number // Out of 10
  image: string // Portrait cover
  bannerImage?: string // Landscape banner
  releaseDate: string
  developer: string
}

export interface Review {
  id: string
  gameId: string
  gameTitle?: string
  gameImage?: string
  userId: string
  username: string
  userReviewCount?: number
  rating: number // Out of 10
  title?: string
  content: string
  likes: number
  createdAt: string
  liked: boolean
  isPositive?: boolean
}

// Mock Data - Real Games
const mockGames: Game[] = [
  {
    id: '1',
    title: 'Elden Ring',
    description:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 9.4,
    image: '/EldenRing.png',
    bannerImage: '/EldenRing.png',

    releaseDate: '2022-02-25',
    developer: 'FromSoftware'
  },
  {
    id: '2',
    title: "Baldur's Gate 3",
    description:
      'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening inside you, drawn from a mind flayer parasite planted in your brain.',
    genre: 'RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 9.6,
    image: '/BaldursGate.png',
    releaseDate: '2023-08-03',
    developer: 'Larian Studios'
  },
  {
    id: '3',
    title: 'The Witcher 3: Wild Hunt',
    description:
      'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
    rating: 9.5,
    image: '/TheWitcher.png',
    releaseDate: '2015-05-18',
    developer: 'CD PROJEKT RED'
  },
  {
    id: '4',
    title: 'Red Dead Redemption 2',
    description:
      'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, RDR2 is the epic tale of outlaw Arthur Morgan and the infamous Van der Linde gang, on the run across America at the dawn of the modern age.',
    genre: 'Action-Aventure',
    platform: ['PC', 'PlayStation 4', 'Xbox One'],
    rating: 9.3,
    image: '/RedDead.png',
    releaseDate: '2018-10-26',
    developer: 'Rockstar Games'
  },
  {
    id: '5',
    title: 'Cyberpunk 2077',
    description:
      'Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 8.2,
    image: 'CyberPunk.png',
    releaseDate: '2020-12-10',
    developer: 'CD PROJEKT RED'
  },
  {
    id: '6',
    title: 'Hollow Knight',
    description:
      'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.',
    genre: 'Metroidvania',
    platform: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
    rating: 9.0,
    image: '/HollowKnight.png',
    releaseDate: '2017-02-24',
    developer: 'Team Cherry'
  },
  {
    id: '7',
    title: 'Hades',
    description:
      'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.',
    genre: 'Rogue-lite',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
    rating: 9.1,
    image: 'Hades.png',
    releaseDate: '2020-09-17',
    developer: 'Supergiant Games'
  },
  {
    id: '8',
    title: 'Crimson Desert',
    description:
      "Une saga écrite dans le sang. Faites l'expérience de l'incroyable histoire de mercenaires luttant pour leur survie dans l'immense continent de Pywel. Un âge où les légendes disparaissent. Que vous le vouliez ou non, vous serez profondément impliqué dans l'histoire et le destin de ce monde.",
    genre: 'Action-Aventure',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 6.7,
    image: '/CrimsonDesert.png',

    bannerImage: '/CrimsonDesert.png',

    releaseDate: '2026-03-19',
    developer: 'Pearl Abyss'
  }
]

let mockReviews: Review[] = [
  {
    id: '101',
    gameId: '1',
    gameTitle: 'Elden Ring',
    gameImage: '/EldenRing.png',
    userId: '2',
    username: 'Kelemvor',
    userReviewCount: 738,
    rating: 10,
    title: "Le chef-d'œuvre absolu de FromSoftware",
    content:
      "Elden Ring est l'aboutissement de la formule Soulsborne. Le monde ouvert est gigantesque, rempli de secrets et la direction artistique est à couper le souffle. Chaque zone offre son lot de défis et de découvertes. Une expérience inoubliable qui redéfinit le genre.",
    likes: 1245,
    createdAt: '2022-03-15T10:30:00Z',
    liked: false,
    isPositive: true
  },
  {
    id: '102',
    gameId: '8',
    gameTitle: 'Crimson Desert',
    gameImage: '/CrimsonDesert',

    userId: '3',
    username: 'Fred Mngz',
    userReviewCount: 173,
    rating: 6,
    title: 'Du potentiel partout... mais rien qui accroche vraiment',
    content:
      "(Avis sujet à MaJ) Je vais être honnête : Crimson Desert, j'avais envie de l'aimer. Les trailers m'avaient vendu un truc un peu fou, un monde vivant, des combats bordéliques mais stylés... le genre de jeu où tu te perds pendant des heures sans voir le temps passer. Au début tu y crois vraiment! Les...",
    likes: 657,
    createdAt: '2026-03-20T14:15:00Z',
    liked: true,
    isPositive: true
  },
  {
    id: '103',
    gameId: '2',
    gameTitle: "Baldur's Gate 3",
    gameImage: '/BaldursGate.png',
    userId: '4',
    username: 'Moizi',
    userReviewCount: 2561,
    rating: 9,
    title: 'Le nouveau standard du RPG',
    content:
      "Larian Studios a réussi l'impossible : retranscrire la liberté du jeu de rôle papier dans un jeu vidéo. Les choix ont de vraies conséquences, l'écriture est brillante et les combats tactiques sont profonds. Un monument.",
    likes: 892,
    createdAt: '2023-08-18T09:45:00Z',
    liked: false,
    isPositive: true
  },
  {
    id: '104',
    gameId: '8',
    gameTitle: 'Crimson Desert',
    gameImage: '/CrimsonDesert.png',

    userId: '5',
    username: 'u_bc0f5f8571aad470c4',
    userReviewCount: 1,
    rating: 5,
    title:
      'Le ragoût de caviar, macaron, homard, chocolat grand cru et foie gras',
    content:
      "Crimson Desert est un ovni vidéoludique, inspiré des plus grands noms du jeu vidéo de ces dernières années, il n'a malheureusement ni leur génie, ni leur science du game design pour leur arriver à la cheville. Je vais souvent...",
    likes: 12,
    createdAt: '2026-03-22T16:20:00Z',
    liked: false,
    isPositive: false
  },
  {
    id: '105',
    gameId: '3',
    gameTitle: 'The Witcher 3: Wild Hunt',
    gameImage: '/TheWitcher.png',
    userId: '6',
    username: 'damon8671',
    userReviewCount: 545,
    rating: 9,
    title: 'Le sens de la vie, vous avez 80 heures',
    content:
      "L'écriture des quêtes, même secondaires, est d'un niveau rarement atteint. Le monde est crédible, mature et sombre. Geralt est un protagoniste fascinant. Seul le système de combat manque un peu de profondeur.",
    likes: 2105,
    createdAt: '2015-06-05T11:10:00Z',
    liked: false,
    isPositive: true
  }
]

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API Functions
export const gameService = {
  getGames: async (): Promise<Game[]> => {
    await delay(600)
    return [...mockGames]
  },

  getGameById: async (id: string): Promise<Game | undefined> => {
    await delay(400)
    return mockGames.find((g) => g.id === id)
  },

  getTrendingGames: async (): Promise<Game[]> => {
    await delay(500)
    return [...mockGames].sort((a, b) => b.rating - a.rating).slice(0, 5)
  },

  getLatestReleases: async (): Promise<Game[]> => {
    await delay(500)
    return [...mockGames]
      .sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )
      .slice(0, 5)
  }
}

export const reviewService = {
  getReviewsByGame: async (gameId: string): Promise<Review[]> => {
    await delay(500)
    return mockReviews
      .filter((r) => r.gameId === gameId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  },

  getLatestReviews: async (): Promise<Review[]> => {
    await delay(400)
    return [...mockReviews]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3)
  },

  getUserReviews: async (userId: string): Promise<Review[]> => {
    await delay(500)
    return mockReviews.filter((r) => r.userId === userId)
  },

  addReview: async (
    review: Omit<Review, 'id' | 'createdAt' | 'likes' | 'liked'>
  ): Promise<Review> => {
    await delay(800)
    const newReview: Review = {
      ...review,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      isPositive: review.rating >= 6
    }
    mockReviews = [newReview, ...mockReviews]
    return newReview
  },

  toggleLike: async (reviewId: string): Promise<Review> => {
    await delay(300)
    const reviewIndex = mockReviews.findIndex((r) => r.id === reviewId)
    if (reviewIndex === -1) throw new Error('Review not found')

    const review = mockReviews[reviewIndex]
    const updatedReview = {
      ...review,
      liked: !review.liked,
      likes: review.liked ? review.likes - 1 : review.likes + 1
    }

    mockReviews[reviewIndex] = updatedReview
    return updatedReview
  }
}

export const adminService = {
  getStats: async () => {
    await delay(600)
    return {
      totalUsers: 1245,
      totalGames: mockGames.length,
      totalReviews: mockReviews.length,
      reportedReviews: 3
    }
  }
}
