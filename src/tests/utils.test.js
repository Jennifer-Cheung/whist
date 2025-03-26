import { test, expect } from "vitest"
import {
  rankBiggerThan,
  isNumber,
  cardBiggerThan,
  getUnicodeCard,
  shuffleDeck,
  getSuitName,
  cardToIndex,
  indexToCard,
} from "../utils"
import { Suit } from "../types"

test("isNumber function", () => {
  // Numbers should return true
  expect(isNumber("2")).toBe(true)
  expect(isNumber("10")).toBe(true)

  // Letters should return false
  expect(isNumber("J")).toBe(false)
  expect(isNumber("Q")).toBe(false)
  expect(isNumber("K")).toBe(false)
  expect(isNumber("A")).toBe(false)
})

test("rankBiggerThan function - comparing numbers", () => {
  expect(rankBiggerThan("10", "9")).toBe(true)
  expect(rankBiggerThan("5", "2")).toBe(true)
  expect(rankBiggerThan("2", "5")).toBe(false)
})

test("rankBiggerThan function - comparing face cards", () => {
  expect(rankBiggerThan("A", "K")).toBe(true)
  expect(rankBiggerThan("K", "Q")).toBe(true)
  expect(rankBiggerThan("Q", "J")).toBe(true)
  expect(rankBiggerThan("J", "A")).toBe(false)
})

test("rankBiggerThan function - comparing numbers with face cards", () => {
  expect(rankBiggerThan("J", "10")).toBe(true)
  expect(rankBiggerThan("10", "J")).toBe(false)
  expect(rankBiggerThan("A", "5")).toBe(true)
  expect(rankBiggerThan("2", "K")).toBe(false)
})

test("cardBiggerThan function", () => {
  // Same suit comparison
  expect(
    cardBiggerThan(
      { suit: Suit.Hearts, rank: "A" },
      { suit: Suit.Hearts, rank: "2" },
      Suit.Spades
    )
  ).toBe(true)
  expect(
    cardBiggerThan(
      { suit: Suit.Clubs, rank: "10" },
      { suit: Suit.Clubs, rank: "9" },
      Suit.Diamonds
    )
  ).toBe(true)

  // Trump suit wins
  expect(
    cardBiggerThan(
      { suit: Suit.Hearts, rank: "A" },
      { suit: Suit.Spades, rank: "2" },
      Suit.Spades
    )
  ).toBe(false)

  // Leading card wins when second card can't follow suit
  expect(
    cardBiggerThan(
      { suit: Suit.Hearts, rank: "2" },
      { suit: Suit.Diamonds, rank: "A" },
      Suit.Spades
    )
  ).toBe(true)
})

test("getUnicodeCard function", () => {
  // Test Ace cards (rank 1)
  expect(getUnicodeCard(Suit.Spades, "A")).toBe("🂡") // U+1F0A1
  expect(getUnicodeCard(Suit.Hearts, "A")).toBe("🂱") // U+1F0B1
  expect(getUnicodeCard(Suit.Diamonds, "A")).toBe("🃁") // U+1F0C1
  expect(getUnicodeCard(Suit.Clubs, "A")).toBe("🃑") // U+1F0D1

  // Test number cards
  expect(getUnicodeCard(Suit.Spades, "2")).toBe("🂢") // U+1F0A2
  expect(getUnicodeCard(Suit.Hearts, "10")).toBe("🂺") // U+1F0BA

  // Test face cards
  expect(getUnicodeCard(Suit.Diamonds, "J")).toBe("🃋") // U+1F0CB
  expect(getUnicodeCard(Suit.Clubs, "Q")).toBe("🃝") // U+1F0DD
  expect(getUnicodeCard(Suit.Spades, "K")).toBe("🂮") // U+1F0AE
})

test("shuffleDeck function", () => {
  const deck = shuffleDeck()
  expect(deck.length).toBe(52) // Standard deck size

  // Check if all cards are unique
  const uniqueCards = new Set(deck.map((card) => `${card.suit}-${card.rank}`))
  expect(uniqueCards.size).toBe(52)

  // Verify card distribution
  const suits = deck.map((card) => card.suit)
  const suitCounts = suits.reduce((acc, suit) => {
    acc[suit] = (acc[suit] || 0) + 1
    return acc
  }, {})

  // Each suit should have 13 cards
  Object.values(suitCounts).forEach((count) => {
    expect(count).toBe(13)
  })
})

test("getSuitName function", () => {
  expect(getSuitName(Suit.Spades)).toBe("Spades")
  expect(getSuitName(Suit.Hearts)).toBe("Hearts")
  expect(getSuitName(Suit.Diamonds)).toBe("Diamonds")
  expect(getSuitName(Suit.Clubs)).toBe("Clubs")
})

test("cardToIndex and indexToCard functions", () => {
  // Test Spades (first suit)
  expect(cardToIndex({ suit: Suit.Spades, rank: "A" })).toBe(0) // First card
  expect(cardToIndex({ suit: Suit.Spades, rank: "2" })).toBe(1)
  expect(cardToIndex({ suit: Suit.Spades, rank: "10" })).toBe(9)
  expect(cardToIndex({ suit: Suit.Spades, rank: "J" })).toBe(10)
  expect(cardToIndex({ suit: Suit.Spades, rank: "Q" })).toBe(11)
  expect(cardToIndex({ suit: Suit.Spades, rank: "K" })).toBe(12)

  // Test Hearts (second suit)
  expect(cardToIndex({ suit: Suit.Hearts, rank: "A" })).toBe(13) // First card of Hearts
  expect(cardToIndex({ suit: Suit.Hearts, rank: "2" })).toBe(14)
  expect(cardToIndex({ suit: Suit.Hearts, rank: "K" })).toBe(25)

  // Test Diamonds (third suit)
  expect(cardToIndex({ suit: Suit.Diamonds, rank: "A" })).toBe(26) // First card of Diamonds
  expect(cardToIndex({ suit: Suit.Diamonds, rank: "5" })).toBe(30)
  expect(cardToIndex({ suit: Suit.Diamonds, rank: "K" })).toBe(38)

  // Test Clubs (fourth suit)
  expect(cardToIndex({ suit: Suit.Clubs, rank: "A" })).toBe(39) // First card of Clubs
  expect(cardToIndex({ suit: Suit.Clubs, rank: "7" })).toBe(45)
  expect(cardToIndex({ suit: Suit.Clubs, rank: "K" })).toBe(51) // Last card

  // Test bidirectional conversion
  for (let i = 0; i < 52; i++) {
    const card = indexToCard(i)
    expect(cardToIndex(card)).toBe(i)
  }

  // Test specific conversions back from index to card
  expect(indexToCard(0)).toEqual({ suit: Suit.Spades, rank: "A" })
  expect(indexToCard(1)).toEqual({ suit: Suit.Spades, rank: "2" })
  expect(indexToCard(13)).toEqual({ suit: Suit.Hearts, rank: "A" })
  expect(indexToCard(26)).toEqual({ suit: Suit.Diamonds, rank: "A" })
  expect(indexToCard(51)).toEqual({ suit: Suit.Clubs, rank: "K" })
})
