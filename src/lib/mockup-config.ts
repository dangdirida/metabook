export interface MockupConfig {
  id: string;
  name: string;
  files: {
    base?: string;
    product: string;
    overlay?: string;
    thumbnail: string;
  };
  printArea: { x: number; y: number; w: number; h: number };
  canvasSize: { width: number; height: number };
}

export const MOCKUP_CONFIGS: Record<string, MockupConfig> = {
  phonecase: {
    id: "phonecase",
    name: "폰케이스",
    files: {
      base: "/mockups/phonecase/phonecase_base.png",
      product: "/mockups/phonecase/phonecase_product.png",
      overlay: "/mockups/phonecase/phonecase_overlay.png",
      thumbnail: "/mockups/phonecase/phonecase_thumbnail.png",
    },
    printArea: { x: 0.08, y: 0.05, w: 0.84, h: 0.90 },
    canvasSize: { width: 500, height: 700 },
  },
  tumbler: {
    id: "tumbler",
    name: "텀블러",
    files: {
      base: "/mockups/tumbler/tumbler_base.png",
      product: "/mockups/tumbler/tumbler_product.png",
      overlay: "/mockups/tumbler/tumbler_overlay.png",
      thumbnail: "/mockups/tumbler/tumbler_thumbnail.png",
    },
    printArea: { x: 0.20, y: 0.10, w: 0.60, h: 0.80 },
    canvasSize: { width: 400, height: 700 },
  },
  photocard: {
    id: "photocard",
    name: "포토카드",
    files: {
      base: "/mockups/photocard/photocard_base.png",
      product: "/mockups/photocard/photocard_product.png",
      overlay: "/mockups/photocard/photocard_overlay.png",
      thumbnail: "/mockups/photocard/photocard_thumbnail.png",
    },
    printArea: { x: 0.05, y: 0.05, w: 0.90, h: 0.90 },
    canvasSize: { width: 500, height: 700 },
  },
};
