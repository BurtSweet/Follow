import type { EntryModel } from "@renderer/models"

import { createZustandStore } from "../utils/helper"
import { getImageDimensionsFromDb } from "./db"
import type { StoreImageType } from "./types"

interface State {
  images: Record<string, StoreImageType>
}
export const useImageStore = createZustandStore<State>("image")(() => ({
  images: {},
}))

const set = useImageStore.setState
const get = useImageStore.getState

class ImageActions {
  getImage(src: string) {
    return get().images[src]
  }

  saveImages(images: StoreImageType[]) {
    set((state) => {
      const newImages = { ...state.images }
      for (const image of images) {
        newImages[image.src] = image
      }
      return { images: newImages }
    })
  }

  async fetchDimensionsFromDb(images: string[]) {
    const dims = [] as StoreImageType[]
    for (const image of images) {
      const dbData = await getImageDimensionsFromDb(image)
      if (dbData) {
        dims.push(dbData)
      }
    }
    imageActions.saveImages(dims)
  }

  getImagesFromEntry(entry: EntryModel) {
    const images = [] as string[]
    if (!entry.media) return images
    for (const media of entry.media) {
      if (media.type === "photo") {
        images.push(media.url)
      }
    }
    return images
  }
}
export const imageActions = new ImageActions()
/// // HOOKS
export const useImageDimensions = (url: string) =>
  useImageStore((state) => state.images[url])
export const useImagesHasDimensions = (urls?: string[]) =>
  useImageStore((state) =>
    urls ? urls?.every((url) => state.images[url]) : false,
  )
