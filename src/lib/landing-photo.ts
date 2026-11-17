/**
 * The landing-page hero photo. Until a photo is added the hero shows the
 * pitch illustration instead, so this can stay null safely.
 *
 * To add one: save the image as public/landing/hero.jpg (roughly 1600px wide)
 * and fill this in. Openly licensed photos (e.g. CC BY-SA from Wikimedia
 * Commons / Geograph) must keep the credit and licence; your own photo can
 * use your name.
 */
export const HERO_PHOTO: {
  src: string;
  alt: string;
  credit: string;
  licence: string;
  sourceUrl: string;
} | null = null;
