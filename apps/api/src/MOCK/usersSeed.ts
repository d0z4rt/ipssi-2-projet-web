/**
 * the default password for all the users is `Strongpass1`
 */
export const usersSeed = [
  {
    username: 'john_doe',
    mail: 'john@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
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
  },
  {
    username: 'hardcore_gamer',
    mail: 'hardcore_gamer@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: false
  },
  {
    username: 'luna_wanderer',
    mail: 'luna@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: true
  },
  {
    username: 'pixel_pirate',
    mail: 'pirate@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: false
  },
  {
    username: 'code_kat',
    mail: 'kat.coder@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: false
  },
  {
    username: 'echo_valkyrie',
    mail: 'echo@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: true,
    is_curator: false
  },
  {
    username: 'quest_master_zen',
    mail: 'zen.quest@example.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$mOWjwmOc9Uzxx13HmKMrBw$JxaZSk5rVn/qlVzEFsvbNUxN6h3L+XL6dTwux1dIRwk',
    is_admin: false,
    is_curator: true
  }
]
