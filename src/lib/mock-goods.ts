import type { Goods } from "@/types";

export const mockGoods: Goods[] = [
  {
    id: "g1",
    bookId: "guns-germs-steel",
    name: "얄리 아크릴 스탠드",
    description: "총균쇠의 얄리 캐릭터 아크릴 스탠드. 한정판 500개.",
    price: 15000,
    imageUrl: "/covers/goods1.jpg",
    images: [],
    stock: 42,
    isLimitedEdition: true,
    externalUrl: "https://example.com/shop",
    createdAt: "2024-11-01",
  },
  {
    id: "g2",
    bookId: "guns-germs-steel",
    name: "비옥한 초승달 포스터",
    description: "고대 농경 일러스트 포스터 (A3)",
    price: 12000,
    imageUrl: "/covers/goods2.jpg",
    images: [],
    stock: 0,
    isLimitedEdition: false,
    externalUrl: "https://example.com/shop",
    createdAt: "2024-11-05",
  },
  {
    id: "g3",
    bookId: "guns-germs-steel",
    name: "총균쇠 에코백",
    description: "재레드 다이아몬드 명언이 인쇄된 에코백",
    price: 18000,
    imageUrl: "/covers/goods3.jpg",
    images: [],
    stock: 128,
    isLimitedEdition: false,
    externalUrl: "https://example.com/shop",
    createdAt: "2024-11-10",
  },
];

export function getGoodsByBookId(bookId: string): Goods[] {
  return mockGoods.filter((g) => g.bookId === bookId);
}
