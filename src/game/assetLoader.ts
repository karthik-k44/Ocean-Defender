import { AssetKey, StageAssets } from "./types";

export type AssetMap = Record<AssetKey, HTMLImageElement>;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });

export const loadStageAssets = async (assets: StageAssets): Promise<AssetMap> => {
  const entries = Object.entries(assets.files) as [AssetKey, string][];
  const loadedEntries = await Promise.all(
    entries.map(async ([key, fileName]) => {
      const image = await loadImage(`${assets.basePath}/${fileName}`);
      return [key, image] as const;
    })
  );

  return Object.fromEntries(loadedEntries) as AssetMap;
};