import { VIDEO_MANIFEST } from './videoManifest';

export const DRESS_CATEGORIES = [
  'All Lehengas',
  'Navratri Special'
];

export const DRESSES_DATA = [
  {
    id: 'dress-1',
    title: 'Navratri Special Gamthi Embroidered Lehenga',
    category: 'Navratri Special',
    material: 'Pure Cotton & Gamthi Threadwork',
    price: 14999,
    originalPrice: 21999,
    discount: '-32%',
    rating: 4.9,
    reviewCount: 142,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 8,
    hidden: false,
    image: '/dresses/dress_1.jpg',
    framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl,
    description: 'Festive Navratri Gamthi designer lehenga choli with traditional Gujarati mirror-work borders, hand-embroidered floral motifs, and multi-layered circular flare.',
    details: [
      '100% Breathable Khadi Cotton with Heavy Gamthi Threadwork',
      'Authentic Kutch mirror-work border on 6-meter circular ghera',
      'Matching embroidered blouse piece with dori tie-backs',
      'Dynamic 360-degree turnaround verified Garba-spin fitting'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#1a1a1a' },
      { name: 'Festive Maroon', hex: '#7a182b' },
      { name: 'Mustard Gold', hex: '#d4af37' }
    ],
    sizes: ['L', 'XL', 'XXL', 'XXXL'],
    defaultSize: 'L',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_03',
        videoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      },
      'XXXL': {
        framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Lehenga', 'Ghagra', 'Chaniya Choli', 'Gamthi', 'Garba']
  },
  {
    id: 'dress-2',
    title: 'Navratri Special Peacock Blue Resham Ghagra',
    category: 'Navratri Special',
    material: 'Art Silk & Gold Resham',
    price: 16499,
    originalPrice: 23999,
    discount: '-31%',
    rating: 4.8,
    reviewCount: 98,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 6,
    hidden: false,
    image: '/dresses/dress_2.jpg',
    framesFolder: '/frames_02',
        videoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].firebaseStorageUrl,
    description: 'Vibrant royal peacock blue Ghagra with intricate gold Resham embroidery, festive latkan tassels, and light-reflecting sequin borders tailored for Garba nights.',
    details: [
      'Premium Chanderi Art Silk with Gold Resham Butti',
      'High-spin circular flair with reinforced can-can netting',
      'Handmade designer latkans and contrast Dupatta border',
      'Dynamic 360-degree turnaround verified Garba-spin fitting'
    ],
    colors: [
      { name: 'Peacock Blue', hex: '#0f4c81' },
      { name: 'Antique Gold', hex: '#c5a059' },
      { name: 'Emerald Green', hex: '#1b4d3e' }
    ],
    sizes: ['L', 'XL', 'XXL'],
    defaultSize: 'L',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_02',
        videoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_04',
        videoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Ghagra', 'Lehenga', 'Peacock Blue', 'Resham', 'Garba']
  },
  {
    id: 'dress-3',
    title: 'Navratri Special Emerald Green Kutch Mirror Lehenga',
    category: 'Navratri Special',
    material: 'Mulberry Satin & Kutch Mirror',
    price: 18999,
    originalPrice: 26999,
    discount: '-30%',
    rating: 4.9,
    reviewCount: 164,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 12,
    hidden: false,
    image: '/dresses/dress_3.jpg',
    framesFolder: '/frames_03',
        videoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Lush emerald green Chaniya Choli featuring traditional Abhala (real glass mirror) embroidery, geometric Kutch needlework, and 360-degree twirling kalis.',
    details: [
      'Heavy Satin Georgette with genuine Kutch Abhala mirror work',
      'Double layer micro-crepe lining for breathable comfort during dance',
      'Stitched waist with adjustable metallic drawstrings and latkans',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Emerald Green', hex: '#1b4d3e' },
      { name: 'Forest Pine', hex: '#22533c' },
      { name: 'Sindoor Red', hex: '#b31b1b' }
    ],
    sizes: ['L', 'XL', 'XXL', 'XXXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_03',
        videoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['03_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      },
      'XXXL': {
        framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Lehenga', 'Kutch Mirror', 'Emerald Green', 'Garba']
  },
  {
    id: 'dress-4',
    title: 'Navratri Special Obsidian Black Velvet Chaniya Choli',
    category: 'Navratri Special',
    material: 'Micro Velvet & Zari Borders',
    price: 19499,
    originalPrice: 27999,
    discount: '-30%',
    rating: 5.0,
    reviewCount: 88,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 5,
    hidden: false,
    image: '/dresses/dress_4.jpg',
    framesFolder: '/frames_04',
        videoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Opulent deep obsidian velvet choli and ghagra featuring handcrafted antique silver zari borders and traditional Navratri motifs with heavy flare.',
    details: [
      'Heavy 9000 Micro Velvet with antique silver Zari threadwork',
      'Full 360-degree round cut with stiff can-can skirt volume',
      'Designer backless blouse styling with beaded tie-string latkans',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Midnight Obsidian', hex: '#111111' },
      { name: 'Crimson Wine', hex: '#6b1d2f' },
      { name: 'Royal Silver', hex: '#c0c0c0' }
    ],
    sizes: ['L', 'XL', 'XXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_02',
        videoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_04',
        videoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['04_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Velvet', 'Chaniya Choli', 'Black Lehenga', 'Garba']
  },
  {
    id: 'dress-5',
    title: 'Navratri Special Ruby Wine Fluted Georgette Ghagra',
    category: 'Navratri Special',
    material: 'Fox Georgette & Sequins',
    price: 13999,
    originalPrice: 19999,
    discount: '-30%',
    rating: 4.7,
    reviewCount: 112,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 9,
    hidden: false,
    image: '/dresses/dress_5.jpg',
    framesFolder: '/frames_05',
        videoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Festive ruby wine fluted kali Ghagra crafted with micro-sequin border trims, soft flowing fox georgette fabric, and effortless Garba spin dynamics.',
    details: [
      'Flowing Fox Georgette with 8-meter voluminous flare',
      'Tonal micro-sequins with foil print highlights',
      'Soft butter-crepe inner lining for all-night comfort',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Ruby Wine', hex: '#6b1d2f' },
      { name: 'Maroon Dahlia', hex: '#4c1421' },
      { name: 'Rose Quartz', hex: '#f7cac9' }
    ],
    sizes: ['L', 'XL', 'XXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_05',
        videoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Ghagra', 'Georgette', 'Ruby Wine', 'Garba']
  },
  {
    id: 'dress-6',
    title: 'Navratri Special Patola Heritage Zari Silk Lehenga',
    category: 'Navratri Special',
    material: 'Pure Silk & Patola Weave',
    price: 22999,
    originalPrice: 31999,
    discount: '-28%',
    rating: 4.9,
    reviewCount: 205,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 7,
    hidden: false,
    image: '/dresses/dress_6.jpg',
    framesFolder: '/frames_06',
        videoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Authentic Patan Patola inspired double-ikat geometric motif silk lehenga with woven pure zari border and contrasting heavy designer dupatta.',
    details: [
      'Pure Silk Blend with traditional Gujarati Patola weave motifs',
      'Woven pure gold Zari pallu and hemline piping',
      'Includes stitched kali skirt with heavy dual can-can structure',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Heritage Red & Black', hex: '#2b0d12' },
      { name: 'Mustard Patola', hex: '#e1a100' },
      { name: 'Forest Green', hex: '#1b4d3e' }
    ],
    sizes: ['L', 'XL', 'XXL', 'XXXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_02',
        videoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_06',
        videoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      },
      'XXXL': {
        framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Patola', 'Silk Lehenga', 'Heritage', 'Garba']
  },
  {
    id: 'dress-7',
    title: 'Navratri Special Sapphire Blue Dandiya Raas Lehenga',
    category: 'Navratri Special',
    material: 'Taffeta Silk & Multi-Color Thread',
    price: 15499,
    originalPrice: 21999,
    discount: '-30%',
    rating: 4.8,
    reviewCount: 79,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 10,
    hidden: false,
    image: '/dresses/dress_7.jpg',
    framesFolder: '/frames_07',
        videoSrc: VIDEO_MANIFEST['07_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['07_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Festive sapphire blue Dandiya Raas lehenga choli with vibrant multi-color Gamthi threadwork, colorful pom-pom hangings, and wide mirror-work belt.',
    details: [
      'Lustrous Taffeta Silk with vibrant Kathiyawadi threadwork',
      'High-impact circular flair with traditional festive tassels',
      'Custom designer blouse with scalloped neckline',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Sapphire Blue', hex: '#0f52ba' },
      { name: 'Cobalt Navy', hex: '#002366' },
      { name: 'Bright Yellow', hex: '#ffcc00' }
    ],
    sizes: ['L', 'XL', 'XXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_07',
        videoSrc: VIDEO_MANIFEST['07_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['07_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Lehenga', 'Sapphire Blue', 'Dandiya Raas', 'Garba']
  },
  {
    id: 'dress-8',
    title: 'Navratri Special Mehendi Green Heavy Flare Ghagra',
    category: 'Navratri Special',
    material: 'Chinon Chiffon & Gotta Patti',
    price: 17999,
    originalPrice: 24999,
    discount: '-28%',
    rating: 4.9,
    reviewCount: 134,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 8,
    hidden: false,
    image: '/dresses/dress_8.jpg',
    framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl,
    description: 'Graceful mehendi green circular Ghagra embellished with intricate Gotta Patti border work, Rajasthani floral motifs, and ultra-wide turnaround flare.',
    details: [
      'Premium Chinon Chiffon with handcrafted Gotta Patti laces',
      'Extra-wide 9-meter flare with double can-can reinforcement',
      'Heavy bridal-grade finish for grand Navratri celebrations',
      'Dynamic 360-degree turnaround verified fitting in Size XXL'
    ],
    colors: [
      { name: 'Mehendi Green', hex: '#4a5d23' },
      { name: 'Olive Gold', hex: '#808000' },
      { name: 'Haldi Yellow', hex: '#f4c430' }
    ],
    sizes: ['L', 'XL', 'XXL', 'XXXL'],
    defaultSize: 'XXL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_02',
        videoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['02_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_05',
        videoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['05_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      },
      'XXXL': {
        framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Ghagra', 'Mehendi Green', 'Gotta Patti', 'Garba']
  },
  {
    id: 'dress-9',
    title: 'Navratri Special Rani Pink & Black Velvet Lehenga',
    category: 'Navratri Special',
    material: 'Royal Velvet & Mirror Work',
    price: 21499,
    originalPrice: 29999,
    discount: '-28%',
    rating: 5.0,
    reviewCount: 118,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 6,
    hidden: false,
    image: '/dresses/dress_9.jpg',
    framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl,
    description: 'Striking dual-tone Rani Pink and Jet Black velvet lehenga with royal Rajasthani mirror accents, heavy multi-tier kalis, and statement festive blouse.',
    details: [
      'Luxury Micro-Velvet and Dupion Silk with mirror-work borders',
      'Structured kalis tailored for sizes XL to XXXL with maximum comfort',
      'Elaborate hand-crafted latkans and zardozi belt finish',
      'Dynamic 360-degree turnaround verified fitting in Size XXXL'
    ],
    colors: [
      { name: 'Rani Pink', hex: '#e0115f' },
      { name: 'Jet Black', hex: '#111111' },
      { name: 'Burnished Gold', hex: '#d4af37' }
    ],
    sizes: ['L', 'XL', 'XXL', 'XXXL'],
    defaultSize: 'XXXL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_06',
        videoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['06_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      },
      'XXXL': {
        framesFolder: '/frames_09',
        videoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['09_Character Turnaround_XXXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Rani Pink', 'Velvet Lehenga', 'Mirror Work', 'Garba']
  },
  {
    id: 'dress-10',
    title: 'Navratri Special Midnight Noir Gamthi Mirror Ghagra',
    category: 'Navratri Special',
    material: 'Pure Khadi Cotton & Glass Mirror',
    price: 18499,
    originalPrice: 25999,
    discount: '-29%',
    rating: 4.9,
    reviewCount: 151,
    badge: '360° Interactive Ready',
    isInteractive: true,
    stock: 11,
    hidden: false,
    image: '/dresses/dress_10.jpg',
    framesFolder: '/frames_10',
        videoSrc: VIDEO_MANIFEST['10_Character Turnaround_XL.mp4'].localUrl,
    fallbackVideoSrc: VIDEO_MANIFEST['10_Character Turnaround_XL.mp4'].firebaseStorageUrl,
    description: 'Classic Gujarati Garba midnight black Ghagra featuring multi-color border piping, heavy Gamthi chest embroidery, and glass mirror kali inserts.',
    details: [
      '100% Khadi Cotton base with multi-thread Gamthi stitchery',
      'High-frequency glass mirror inserts reflecting stadium lights',
      'Sturdy reinforced waistband with handmade thread dori',
      'Dynamic 360-degree turnaround verified fitting in Size XL'
    ],
    colors: [
      { name: 'Midnight Noir', hex: '#161616' },
      { name: 'Rust Amber', hex: '#c04000' },
      { name: 'Turquoise Blue', hex: '#40e0d0' }
    ],
    sizes: ['L', 'XL', 'XXL'],
    defaultSize: 'XL',
    sizeVideos: {
      'L': {
        framesFolder: '/frames_01',
        videoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['01_Character Turnaround_L.mp4'].firebaseStorageUrl
      },
      'XL': {
        framesFolder: '/frames_10',
        videoSrc: VIDEO_MANIFEST['10_Character Turnaround_XL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['10_Character Turnaround_XL.mp4'].firebaseStorageUrl
      },
      'XXL': {
        framesFolder: '/frames_08',
        videoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].localUrl,
        fallbackVideoSrc: VIDEO_MANIFEST['08_Character Turnaround_XXL.mp4'].firebaseStorageUrl
      }
    },
    tags: ['Navratri Special', 'Ghagra', 'Gamthi', 'Midnight Noir', 'Garba']
  }
];

export default DRESSES_DATA;
