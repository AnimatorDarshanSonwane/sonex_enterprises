/**
 * Sonex Enterprises — 360° Studio Turnaround Video Caching Engine
 * 
 * Prevents unnecessary reads and egress costs from Firebase Storage:
 * 1. Checks Browser CacheStorage ('sonex-360-videos-v1') before any network request.
 * 2. If present in cache, serves instantly with ZERO network overhead (0 Firebase read).
 * 3. If not cached, fetches with real-time download progress, caches the response,
 *    and converts to a local Blob URL for seamless 60fps turntable scrubbing.
 * 4. Persists across size changes (L, XL, XXL, XXXL) so switching sizes is instantaneous.
 */

import { resolve360Media } from '../utils/variantMedia';

const CACHE_NAME = 'sonex-360-videos-v1';
const memoryBlobMap = new Map();
const framesCacheMap = (typeof window !== 'undefined' && window.__SONEX_FRAME_CACHE__) 
  ? window.__SONEX_FRAME_CACHE__ 
  : new Map();

if (typeof window !== 'undefined') {
  window.__SONEX_FRAME_CACHE__ = framesCacheMap;
}

/**
 * Checks if a frames folder sequence (240 WebP images) is already cached in memory
 * @param {string} framesFolder 
 * @returns {boolean}
 */
export function areFramesCached(framesFolder, totalFrames = 240) {
  if (!framesFolder) return false;
  if (!framesCacheMap.has(framesFolder)) return false;
  const imgs = framesCacheMap.get(framesFolder);
  return Array.isArray(imgs) && imgs.length === totalFrames && imgs.every(img => img && img.complete);
}

/**
 * Retrieves preloaded Image instances for a frames folder
 * @param {string} framesFolder 
 * @returns {HTMLImageElement[] | null}
 */
export function getCachedFrames(framesFolder) {
  if (!framesFolder) return null;
  return framesCacheMap.get(framesFolder) || null;
}

/**
 * Preloads all 240 WebP frame sequence images into memory with progress tracking
 * @param {string} framesFolder 
 * @param {number} totalFrames 
 * @param {function} onProgress 
 * @returns {Promise<{ fromCache: boolean, images: HTMLImageElement[] }>}
 */
export async function loadAndCacheFrames(framesFolder, totalFrames = 240, onProgress = () => {}) {
  if (!framesFolder) return { fromCache: true, images: [] };

  if (areFramesCached(framesFolder, totalFrames)) {
    onProgress(100);
    return { fromCache: true, images: framesCacheMap.get(framesFolder) };
  }

  const images = new Array(totalFrames);
  let loadedCount = 0;
  const BATCH_SIZE = 16;
  const indices = Array.from({ length: totalFrames }, (_, i) => i + 1);

  for (let i = 0; i < indices.length; i += BATCH_SIZE) {
    const batch = indices.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((frameNum) => {
        return new Promise((resolve) => {
          const img = new Image();
          const padded = String(frameNum).padStart(4, '0');
          img.src = `${framesFolder}/frame_${padded}.webp`;
          img.onload = () => {
            loadedCount++;
            images[frameNum - 1] = img;
            const pct = Math.min(Math.round((loadedCount / totalFrames) * 100), 99);
            onProgress(pct);
            resolve();
          };
          img.onerror = () => {
            const fallback = new Image();
            fallback.src = `${framesFolder}/frame_${padded}.jpg`;
            fallback.onload = () => {
              loadedCount++;
              images[frameNum - 1] = fallback;
              const pct = Math.min(Math.round((loadedCount / totalFrames) * 100), 99);
              onProgress(pct);
              resolve();
            };
            fallback.onerror = () => {
              loadedCount++;
              images[frameNum - 1] = img;
              const pct = Math.min(Math.round((loadedCount / totalFrames) * 100), 99);
              onProgress(pct);
              resolve();
            };
          };
        });
      })
    );
  }

  framesCacheMap.set(framesFolder, images);
  if (typeof window !== 'undefined') {
    window.__SONEX_FRAME_CACHE__ = framesCacheMap;
  }
  onProgress(100);
  return { fromCache: false, images };
}

/**
 * Unified check if the active media for a dress/variant is cached in browser
 */
export async function isMediaCached(dress, selectedColor, selectedSize) {
  if (!dress) return true;
  const media = resolve360Media(dress, selectedColor, selectedSize);
  if (media.framesFolder) {
    return areFramesCached(media.framesFolder);
  }
  if (media.videoSrc) {
    return await isVideoCached(media.videoSrc);
  }
  return true;
}

/**
 * Unified media loader: Preloads frames folder OR video blob with real-time progress
 */
export async function loadAndCacheMedia(dress, selectedColor, selectedSize, onProgress = () => {}) {
  if (!dress) {
    onProgress(100);
    return { fromCache: true };
  }
  const media = resolve360Media(dress, selectedColor, selectedSize);
  if (media.framesFolder) {
    return await loadAndCacheFrames(media.framesFolder, 240, onProgress);
  }
  if (media.videoSrc) {
    return await loadAndCacheVideo(media.videoSrc, onProgress);
  }
  onProgress(100);
  return { fromCache: true };
}

/**
 * Checks if a video URL is already cached in Browser CacheStorage or memory
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
export async function isVideoCached(url) {
  if (!url) return false;
  if (memoryBlobMap.has(url)) return true;

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      return Boolean(match);
    } catch (e) {
      console.warn('[VideoCache] Cache query check error:', e);
    }
  }
  return false;
}

/**
 * Loads and caches a turnaround video on demand.
 * Only called when the user selects a card for 3D preview or switches sizes.
 * 
 * @param {string} url Video URL (Firebase Storage download URL or local /videos path)
 * @param {function} onProgress Callback for percentage loaded: (percent: number) => void
 * @returns {Promise<{ objectUrl: string, fromCache: boolean, sizeBytes?: number }>}
 */
export async function loadAndCacheVideo(url, onProgress = () => {}) {
  if (!url) throw new Error('Video URL is required for 360 preview loading');

  // 1. Check in-memory Object URL map
  if (memoryBlobMap.has(url)) {
    onProgress(100);
    return { objectUrl: memoryBlobMap.get(url), fromCache: true };
  }

  // 2. Check Browser CacheStorage API
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);

      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        memoryBlobMap.set(url, objectUrl);
        onProgress(100);
        return { objectUrl, fromCache: true, sizeBytes: blob.size };
      }
    } catch (cacheErr) {
      console.warn('[VideoCache] CacheStorage match failed, proceeding to network fetch:', cacheErr);
    }
  }

  // 3. Not in cache -> Fetch with progress tracking and save to cache
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        const percent = Math.min(Math.round((event.loaded / event.total) * 100), 99);
        onProgress(percent);
      } else {
        // Indeterminate progress pulse
        onProgress(50);
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response;
        const objectUrl = URL.createObjectURL(blob);
        memoryBlobMap.set(url, objectUrl);
        onProgress(100);

        // Put in Browser CacheStorage to prevent future Firebase Storage reads
        if (typeof window !== 'undefined' && 'caches' in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            const responseToCache = new Response(blob, {
              headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': String(blob.size),
                'X-Cached-By': 'Sonex-Turnaround-Engine'
              }
            });
            await cache.put(url, responseToCache);
          } catch (cachePutErr) {
            console.warn('[VideoCache] CacheStorage put error:', cachePutErr);
          }
        }

        resolve({ objectUrl, fromCache: false, sizeBytes: blob.size });
      } else {
        reject(new Error(`Failed to download turnaround video (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      // Fallback: If network fetch of external URL failed, return the raw URL as fallback
      console.warn('[VideoCache] XHR failed, falling back to direct video stream');
      resolve({ objectUrl: url, fromCache: false });
    };

    xhr.send();
  });
}

/**
 * Clears all cached turnaround videos from Browser CacheStorage
 */
export async function clearTurnaroundVideoCache() {
  memoryBlobMap.forEach(url => URL.revokeObjectURL(url));
  memoryBlobMap.clear();

  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      await caches.delete(CACHE_NAME);
      return true;
    } catch (e) {
      console.warn('[VideoCache] Clear cache error:', e);
    }
  }
  return false;
}
