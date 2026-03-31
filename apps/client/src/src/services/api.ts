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
  slug: string
  title: string
  description: string
  genre: string
  platform: string[]
  rating: number // Out of 10
  image: string // Portrait cover
  bannerImage?: string // Landscape banner
  screenshots?: string[] // Gallery screenshots
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

export interface ContactRequest {
  firstName: string
  lastName: string
  email: string
  subject: string
  category: 'support' | 'bug-report' | 'business' | 'other'
  message: string
  acceptedPolicy: boolean
}

export interface ContactResponse {
  id: string
  status: 'received'
  createdAt: string
}

const mediaByGameId: Record<
  string,
  {
    bannerImage: string
    screenshots: string[]
  }
> = {
  '1': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg?t=1767883716',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg?t=1767883716',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_dcdac9e4b26ac0ee5248bfd2967d764fd00cdb42.1920x1080.jpg?t=1767883716',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_3c41384a24d86dddd58a8f61db77f9dc0bfda8b5.1920x1080.jpg?t=1767883716',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_e0316c76f8197405c1312d072b84331dd735d60b.1920x1080.jpg?t=1767883716',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_ef61b771ee6b269b1f0cb484233e07a0bfb5f81b.1920x1080.jpg?t=1767883716',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_b1b91299d7e4b94201ac840aa64de54d9f5cb7f3.1920x1080.jpg?t=1767883716'
    ]
  },
  '2': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_c73bc54415178c07fef85f54ee26621728c77504.1920x1080.jpg?t=1773079016',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_c73bc54415178c07fef85f54ee26621728c77504.1920x1080.jpg?t=1773079016',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_73d93bea842b93914d966622104dcb8c0f42972b.1920x1080.jpg?t=1773079016',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_cf936d31061b58e98e0c646aee00e6030c410cda.1920x1080.jpg?t=1773079016',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_b6a6ee6e046426d08ceea7a4506a1b5f44181543.1920x1080.jpg?t=1773079016',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_6b8faba0f6831a406ce015648958da9612d14dbb.1920x1080.jpg?t=1773079016',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/ss_8fc5eba770b4a1639b31666908bdd2bbc1aa2ae4.1920x1080.jpg?t=1773079016'
    ]
  },
  '3': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_5710298af2318afd9aa72449ef29ac4a2ef64d8e.1920x1080.jpg?t=1768303991',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_5710298af2318afd9aa72449ef29ac4a2ef64d8e.1920x1080.jpg?t=1768303991',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_0901e64e9d4b8ebaea8348c194e7a3644d2d832d.1920x1080.jpg?t=1768303991',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_112b1e176c1bd271d8a565eacb6feaf90f240bb2.1920x1080.jpg?t=1768303991',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_d1b73b18cbcd5e9e412c7a1dead3c5cd7303d2ad.1920x1080.jpg?t=1768303991',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_107600c1337accc09104f7a8aa7f275f23cad096.1920x1080.jpg?t=1768303991',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/ss_64eb760f9a2b67f6731a71cce3a8fb684b9af267.1920x1080.jpg?t=1768303991'
    ]
  },
  '4': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_66b553f4c209476d3e4ce25fa4714002cc914c4f.1920x1080.jpg?t=1759502961',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_66b553f4c209476d3e4ce25fa4714002cc914c4f.1920x1080.jpg?t=1759502961',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_bac60bacbf5da8945103648c08d27d5e202444ca.1920x1080.jpg?t=1759502961',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_668dafe477743f8b50b818d5bbfcec669e9ba93e.1920x1080.jpg?t=1759502961',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_4ce07ae360b166f0f650e9a895a3b4b7bf15e34f.1920x1080.jpg?t=1759502961',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/ss_d1a8f5a69155c3186c65d1da90491fcfd43663d9.1920x1080.jpg?t=1759502961'
    ]
  },
  '5': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_2f649b68d579bf87011487d29bc4ccbfdd97d34f.1920x1080.jpg?t=1769690377',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_2f649b68d579bf87011487d29bc4ccbfdd97d34f.1920x1080.jpg?t=1769690377',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_0e64170751e1ae20ff8fdb7001a8892fd48260e7.1920x1080.jpg?t=1769690377',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_af2804aa4bf35d4251043744412ce3b359a125ef.1920x1080.jpg?t=1769690377',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_7924f64b6e5d586a80418c9896a1c92881a7905b.1920x1080.jpg?t=1769690377',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_4eb068b1cf52c91b57157b84bed18a186ed7714b.1920x1080.jpg?t=1769690377',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/ss_b529b0abc43f55fc23fe8058eddb6e37c9629a6a.1920x1080.jpg?t=1769690377'
    ]
  },
  '6': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_5384f9f8b96a0b9934b2bc35a4058376211636d2.1920x1080.jpg?t=1770338567',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_5384f9f8b96a0b9934b2bc35a4058376211636d2.1920x1080.jpg?t=1770338567',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_d5b6edd94e77ba6db31c44d8a3c09d807ab27751.1920x1080.jpg?t=1770338567',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_a81e4231cc8d55f58b51a4a938898af46503cae5.1920x1080.jpg?t=1770338567',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_62e10cf506d461e11e050457b08aa0e2a1c078d0.1920x1080.jpg?t=1770338567',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_bd76bd88bc5334ee56ae3d5f0d8dec4455e8e3b8.1920x1080.jpg?t=1770338567',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_33a645903d6dd9beec39f272a3daf57174a6cc26.1920x1080.jpg?t=1770338567'
    ]
  },
  '7': {
    bannerImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_c0fed447426b69981cf1721756acf75369801b31.1920x1080.jpg?t=1758127023',
    screenshots: [
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_c0fed447426b69981cf1721756acf75369801b31.1920x1080.jpg?t=1758127023',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_8a9f0953e8a014bd3df2789c2835cb787cd3764d.1920x1080.jpg?t=1758127023',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_68300459a8c3daacb2ec687adcdbf4442fcc4f47.1920x1080.jpg?t=1758127023',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_bcb499a0dd001f4101823f99ec5094d2872ba6ee.1920x1080.jpg?t=1758127023',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_8e07e477fa7ff2f88c8984bc89b9652a655da0e9.1920x1080.jpg?t=1758127023',
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/ss_34e6660705cfe47d2b2f95189c37f7cb77f75ca6.1920x1080.jpg?t=1758127023'
    ]
  },
  '8': {
    bannerImage: '/CrimsonDesert.png',
    screenshots: ['/CrimsonDesert.png']
  }
}

// Mock Data - Real Games
const mockGames: Game[] = [
  {
    id: '1',
    slug: 'elden-ring',
    title: 'Elden Ring',
    description:
      'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. A vast world where open fields with a variety of situations and huge dungeons with complex and three-dimensional designs are seamlessly connected.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 9.4,
    image: '/EldenRing.png',
    ...mediaByGameId['1'],
    releaseDate: '2022-02-25',
    developer: 'FromSoftware'
  },
  {
    id: '2',
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    description:
      'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Mysterious abilities are awakening inside you, drawn from a mind flayer parasite planted in your brain.',
    genre: 'RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 9.6,
    image: '/BaldursGate.png',
    ...mediaByGameId['2'],
    releaseDate: '2023-08-03',
    developer: 'Larian Studios'
  },
  {
    id: '3',
    slug: 'the-witcher-3-wild-hunt',
    title: 'The Witcher 3: Wild Hunt',
    description:
      'You are Geralt of Rivia, mercenary monster slayer. Before you stands a war-torn, monster-infested continent you can explore at will. Your current contract? Tracking down Ciri — the Child of Prophecy, a living weapon that can alter the shape of the world.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
    rating: 9.5,
    image: '/TheWitcher.png',
    ...mediaByGameId['3'],
    releaseDate: '2015-05-18',
    developer: 'CD PROJEKT RED'
  },
  {
    id: '4',
    slug: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    description:
      'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, RDR2 is the epic tale of outlaw Arthur Morgan and the infamous Van der Linde gang, on the run across America at the dawn of the modern age.',
    genre: 'Action-Aventure',
    platform: ['PC', 'PlayStation 4', 'Xbox One'],
    rating: 9.3,
    image: '/RedDead.png',
    ...mediaByGameId['4'],
    releaseDate: '2018-10-26',
    developer: 'Rockstar Games'
  },
  {
    id: '5',
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    description:
      'Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and ceaseless body modification.',
    genre: 'Action-RPG',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 8.2,
    image: '/CyberPunk.png',
    ...mediaByGameId['5'],
    releaseDate: '2020-12-10',
    developer: 'CD PROJEKT RED'
  },
  {
    id: '6',
    slug: 'hollow-knight',
    title: 'Hollow Knight',
    description:
      'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.',
    genre: 'Metroidvania',
    platform: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
    rating: 9.0,
    image: '/HollowKnight.png',
    ...mediaByGameId['6'],
    releaseDate: '2017-02-24',
    developer: 'Team Cherry'
  },
  {
    id: '7',
    slug: 'hades',
    title: 'Hades',
    description:
      'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler from the creators of Bastion, Transistor, and Pyre.',
    genre: 'Rogue-lite',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch'],
    rating: 9.1,
    image: '/Hades.png',
    ...mediaByGameId['7'],
    releaseDate: '2020-09-17',
    developer: 'Supergiant Games'
  },
  {
    id: '8',
    slug: 'crimson-desert',
    title: 'Crimson Desert',
    description:
      "Une saga écrite dans le sang. Faites l'expérience de l'incroyable histoire de mercenaires luttant pour leur survie dans l'immense continent de Pywel. Un âge où les légendes disparaissent. Que vous le vouliez ou non, vous serez profondément impliqué dans l'histoire et le destin de ce monde.",
    genre: 'Action-Aventure',
    platform: ['PC', 'PlayStation 5', 'Xbox Series X'],
    rating: 6.7,
    image: '/CrimsonDesert.png',
    ...mediaByGameId['8'],
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
    gameImage: '/CrimsonDesert.png',

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

export const getGameSlugById = (gameId: string): string | undefined =>
  mockGames.find((game) => game.id === gameId)?.slug

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

  getGameBySlug: async (slug: string): Promise<Game | undefined> => {
    await delay(400)
    return mockGames.find((g) => g.slug === slug)
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

export const contactService = {
  submit: async (payload: ContactRequest): Promise<ContactResponse> => {
    const response = await api.post<ContactResponse>('/contact', payload)
    return response.data
  }
}
