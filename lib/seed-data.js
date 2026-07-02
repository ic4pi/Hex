import { v4 as uuidv4 } from 'uuid'

export const TSHIRT_IMG = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?fm=jpg&q=60&w=1200&auto=format&fit=crop'
export const HERO_BG = 'https://images.unsplash.com/photo-1617171073885-7a17050d0992?fm=jpg&q=60&w=3000&auto=format&fit=crop'

export const seedCategories = () => ([
  { id: uuidv4(), slug: 'spell-jars', name: 'Spell Jars', description: 'Handcrafted enchanted apothecary jars.', created_at: new Date() },
  { id: uuidv4(), slug: 'apparel', name: 'Apparel', description: 'Cyber-occult wear.', created_at: new Date() },
  { id: uuidv4(), slug: 'apothecary', name: 'Apothecary', description: 'Herbal blends and ritual essentials.', created_at: new Date() },
])

const baseSpell = {
  care_instructions: 'Keep sealed in a cool, dry place. Do not open the jar — the magic works within.',
  ingredients: 'Salt, dried herbs, curated crystals, wax, intention.',
  safety_disclaimer: 'For spiritual use only. Not a substitute for professional advice. Contains small items — keep away from children and pets.',
  ritual_duration: '7–28 days',
  difficulty: 'Beginner',
  energy_level: 'Strong',
}

export const seedProducts = () => ([
  {
    id: uuidv4(),
    name: 'Protection Spell Jar',
    slug: 'protection-spell-jar',
    category: 'spell-jars',
    description: 'A shielding talisman crafted to ward off negativity and psychic intrusion.',
    rich_description: 'This carefully consecrated jar is hand-blended with black salt, obsidian shards, dragon’s blood resin, and rosemary to form an unbroken circle of protection around your home, altar, or self. Sealed under a waning moon and empowered with a whispered incantation.',
    price: 34.00, compare_at_price: 44.00, sku: 'HXP-SJ-PRT-001', inventory: 25,
    hero_image: '', gallery_images: [],
    featured: true, bestseller: true, new_arrival: false, limited_edition: false, active: true,
    seo_title: 'Protection Spell Jar — Hexpose!', seo_description: 'A shielding talisman for warding and psychic protection.',
    spell: {
      magical_intention: 'Protection & Warding',
      moon_phase: '🌖 Waning Gibbous', planet: '♂ Mars', zodiac: '♏ Scorpio', element: '🜃 Earth', chakra: '🔴 Root',
      crystal: ['Obsidian', 'Black Tourmaline'], herbs: ['Rosemary', 'Bay Leaf', 'Mugwort'],
      candle_color: '⚫ Black', ...baseSpell,
    },
    created_at: new Date(), updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Prosperity Spell Jar',
    slug: 'prosperity-spell-jar',
    category: 'spell-jars',
    description: 'A golden-hued jar to invite abundance, opportunity, and steady flow.',
    rich_description: 'Layered with cinnamon, pyrite, bay leaves inscribed with intentions, and a coin blessed under Jupiter’s hour. Ideal for entrepreneurs, artists, and dreamers charting a bolder cash-flow future.',
    price: 38.00, compare_at_price: 48.00, sku: 'HXP-SJ-PSP-001', inventory: 30,
    hero_image: '', gallery_images: [],
    featured: true, bestseller: false, new_arrival: true, limited_edition: false, active: true,
    seo_title: 'Prosperity Spell Jar — Hexpose!', seo_description: 'A golden charm for abundance and opportunity.',
    spell: {
      magical_intention: 'Abundance & Prosperity',
      moon_phase: '🌒 Waxing Crescent', planet: '♃ Jupiter', zodiac: '♉ Taurus', element: '🜃 Earth', chakra: '🟡 Solar Plexus',
      crystal: ['Pyrite', 'Citrine'], herbs: ['Cinnamon', 'Bay Leaf', 'Basil'],
      candle_color: '🟡 Gold', ...baseSpell,
    },
    created_at: new Date(), updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Love Attraction Spell Jar',
    slug: 'love-attraction-spell-jar',
    category: 'spell-jars',
    description: 'A rose-forward jar to draw devoted, high-vibrational love.',
    rich_description: 'Made with rose petals, rose quartz, dried hibiscus, and a strand of red silk. Charged on a Friday under Venus’s hour to open the heart, magnetize soulmates, and deepen existing bonds.',
    price: 36.00, compare_at_price: 46.00, sku: 'HXP-SJ-LOV-001', inventory: 40,
    hero_image: '', gallery_images: [],
    featured: true, bestseller: true, new_arrival: false, limited_edition: true, active: true,
    seo_title: 'Love Attraction Spell Jar — Hexpose!', seo_description: 'A rose-forward charm for magnetic love.',
    spell: {
      magical_intention: 'Love & Attraction',
      moon_phase: '🌕 Full Moon', planet: '♀ Venus', zodiac: '♎ Libra', element: '🜄 Water', chakra: '💚 Heart',
      crystal: ['Rose Quartz', 'Garnet'], herbs: ['Rose Petals', 'Hibiscus', 'Damiana'],
      candle_color: '🩷 Pink', ...baseSpell,
    },
    created_at: new Date(), updated_at: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Hexpose Logo T-Shirt',
    slug: 'hexpose-logo-tshirt',
    category: 'apparel',
    description: 'Premium heavyweight cotton tee with our neon-glow Hexpose wordmark.',
    rich_description: 'Cut from 100% ring-spun combed cotton with a boxy modern fit, the Hexpose! Logo Tee is printed with a soft-touch neon-glow wordmark that glimmers under UV. Pre-shrunk, side-seamed, and built for ritual wear.',
    price: 42.00, compare_at_price: 55.00, sku: 'HXP-APR-TEE-001', inventory: 80,
    hero_image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?fm=jpg&q=60&w=1200&auto=format&fit=crop',
    gallery_images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?fm=jpg&q=60&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1562135291-7728cc647783?fm=jpg&q=60&w=1200&auto=format&fit=crop',
    ],
    featured: true, bestseller: false, new_arrival: true, limited_edition: false, active: true,
    seo_title: 'Hexpose Logo T-Shirt — Hexpose!', seo_description: 'Premium cotton tee with the neon-glow Hexpose wordmark.',
    spell: null,
    created_at: new Date(), updated_at: new Date(),
  },
])

export const seedHero = () => ({
  id: uuidv4(),
  headline: 'Modern Witchcraft, Handcrafted with Intention',
  subheadline: 'A cyber-occult apothecary of ritual jars, ceremonial apparel, and enchanted essentials — curated for the luminous, the mystic, and the bold.',
  promo_text: 'Free shipping on rituals over $75',
  primary_cta: { label: 'Shop the Ritual', href: '/shop' },
  secondary_cta: { label: 'Explore Spell Jars', href: '/shop?category=spell-jars' },
  background_image: 'https://images.unsplash.com/photo-1617171073885-7a17050d0992?fm=jpg&q=60&w=3000&auto=format&fit=crop',
  overlay_image: '',
  countdown_to: '',
  promo_badge: 'New Moon Collection',
  glow_color: '#ff1177',
  updated_at: new Date(),
})

export const seedBranding = () => ({
  id: 'default',
  site_name: 'Hexpose!',
  logo: '',
  wordmark: '',
  tagline: 'A Witch’s Boutique & Apothecary — modern rituals, handcrafted intention.',
  favicon: '',
  theme_colors: {
    background: '#000000', primary: '#ff1177', accent: '#3ea6ff', lavender: '#c9a8ff', gold: '#ffb347',
  },
  button_style: 'glow',
  typography: { display: 'Cinzel', body: 'Inter' },
  footer_text: '© ' + new Date().getFullYear() + ' Hexpose!  All rights reserved. Crafted under a waxing moon.',
  announcement_banner: '✨ New Moon Collection is live — free shipping on rituals over $75 ✨',
  social: { instagram: 'https://instagram.com/hexpose', facebook: '', twitter: '', tiktok: '', youtube: '' },
  updated_at: new Date(),
})
