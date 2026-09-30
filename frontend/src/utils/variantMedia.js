/**
 * 360° Turnaround Media Resolution Engine
 * Handles dynamic resolution of 360° turnaround videos and frame sequences
 * tailored to specific color shades, sizes, and variant combinations.
 */

export const PRESET_360_VIDEOS = [
  { 
    id: 'v2',
    name: 'Showcase V2 (Default Studio)', 
    videoSrc: '/showcase_v2.mp4', 
    framesFolder: '/showcase_v2_frames' 
  },
  { 
    id: '1080p',
    name: 'Showcase 1080P (Haute Lighting)', 
    videoSrc: '/showcase_1080p.mp4', 
    framesFolder: '/showcase_frames' 
  },
  { 
    id: 'turnaround',
    name: 'Character Turnaround (High-Res)', 
    videoSrc: '/character_turnaround.mp4', 
    framesFolder: '/frames' 
  }
];

/**
 * Resolves the active 360 preview media (video source and/or frames sequence)
 * based on selected color shade and size variant.
 * 
 * Hierarchy:
 * 1. Specific variant override (color + size matching) in dress.variantVideos
 * 2. Color-specific media in dress.colors array (item.videoSrc / item.framesFolder)
 * 3. Color-specific media in dress.colorVideos map (dress.colorVideos[colorName])
 * 4. Size-specific media in dress.sizeVideos map (dress.sizeVideos[sizeName])
 * 5. Base fallback media on dress (dress.videoSrc / dress.framesFolder)
 */
function getBestVideoUrl(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  return entry.fallbackVideoSrc || entry.localUrl || entry.videoSrc || null;
}

export function resolve360Media(dress, selectedColor, selectedSize) {
  if (!dress) {
    return {
      videoSrc: '/videos/01_Character%20Turnaround_L.mp4',
      framesFolder: null,
      sourceType: 'default',
      label: 'Standard 360° Studio',
      colorName: '',
      sizeName: ''
    };
  }

  const colorName = typeof selectedColor === 'string' 
    ? selectedColor 
    : (selectedColor?.name || '');
  const sizeName = typeof selectedSize === 'string' ? selectedSize : '';

  const baseVideo = dress.fallbackVideoSrc || dress.localUrl || dress.videoSrc || '/videos/01_Character%20Turnaround_L.mp4';

  // 1. Exact Variant Match (Color + Size)
  if (Array.isArray(dress.variantVideos) && dress.variantVideos.length > 0) {
    const exact = dress.variantVideos.find(v => {
      const vCol = (v.color || '').trim().toLowerCase();
      const vSize = (v.size || '').trim().toUpperCase();
      const targetCol = colorName.trim().toLowerCase();
      const targetSize = sizeName.trim().toUpperCase();
      
      const matchCol = !vCol || vCol === targetCol;
      const matchSize = !vSize || vSize === targetSize;
      return matchCol && matchSize && (v.videoSrc || v.fallbackVideoSrc || v.localUrl || v.framesFolder);
    });

    if (exact) {
      const vSrc = getBestVideoUrl(exact);
      return {
        videoSrc: vSrc || baseVideo,
        framesFolder: exact.framesFolder || dress.framesFolder || null,
        sourceType: 'variant',
        label: `${colorName || 'Variant'} • Size ${sizeName || ''}`.trim(),
        colorName,
        sizeName
      };
    }
  }

  // 2. Color-specific video in dress.colors list
  if (colorName && Array.isArray(dress.colors)) {
    const colObj = dress.colors.find(c => (c.name || '').trim().toLowerCase() === colorName.trim().toLowerCase());
    if (colObj) {
      const vSrc = getBestVideoUrl(colObj);
      if (vSrc || colObj.framesFolder) {
        return {
          videoSrc: vSrc || baseVideo,
          framesFolder: colObj.framesFolder || dress.framesFolder || null,
          sourceType: 'color',
          label: `Shade: ${colorName}`,
          colorName,
          sizeName
        };
      }
    }
  }

  // 3. Color-specific video in dress.colorVideos dictionary
  if (colorName && dress.colorVideos && dress.colorVideos[colorName]) {
    const entry = dress.colorVideos[colorName];
    const vSrc = getBestVideoUrl(entry);
    const fFold = typeof entry === 'object' ? entry.framesFolder : null;
    if (vSrc || fFold) {
      return {
        videoSrc: vSrc || baseVideo,
        framesFolder: fFold || dress.framesFolder || null,
        sourceType: 'color',
        label: `Shade: ${colorName}`,
        colorName,
        sizeName
      };
    }
  }

  // 4. Size-specific video in dress.sizeVideos dictionary
  if (sizeName && dress.sizeVideos && dress.sizeVideos[sizeName]) {
    const entry = dress.sizeVideos[sizeName];
    const vSrc = getBestVideoUrl(entry);
    const fFold = typeof entry === 'object' ? entry.framesFolder : null;
    if (vSrc || fFold) {
      return {
        videoSrc: vSrc || baseVideo,
        framesFolder: fFold || dress.framesFolder || null,
        sourceType: 'size',
        label: `Fit: Size ${sizeName}`,
        colorName,
        sizeName
      };
    }
  }

  // 5. Default base product 360 media
  return {
    videoSrc: baseVideo,
    framesFolder: dress.framesFolder || null,
    sourceType: 'default',
    label: 'Standard 360° Studio',
    colorName,
    sizeName
  };
}
