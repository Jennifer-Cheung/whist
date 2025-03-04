import { random, range } from "lodash"

/**
 * The four suits
 */
export enum Suit {
  Spades,
  Hearts,
  Diamonds,
  Clubs,
}

const numberRegex = /^\d+$/
const isNumber = (c: string) => {
  return numberRegex.test(c)
}
const letters = ["J", "C", "Q", "K", "A"]

/**
 * Regardless of suits, returns whether the first card is bigger than the second card
 * @param rank1 The rank of the first card
 * @param rank2 The rank of the second card
 * @returns whether the first rank is bigger than the second rank
 */
export const rankBiggerThan = (rank1: string, rank2: string) => {
  if (isNumber(rank1) && isNumber(rank2)) {
    return rank1 > rank2
  } else if (!isNumber(rank1) && !isNumber(rank2)) {
    return letters.indexOf(rank1) > letters.indexOf(rank2)
  } else {
    return isNumber(rank2)
  }
}

/**
 * Returns the unicode symbol for displaying a card
 * @param suit Suit of the card
 * @param rank Rank of the card
 * @returns The unicode symbol of the card
 */
export const getUnicodeCard = (suit: Suit, rank: string | number) => {
  const base = 127136
  const period = 16
  if (rank === "A") {
    rank = 1
  }
  if (typeof rank !== "number" && !isNumber(rank)) {
    rank = 11 + letters.indexOf(rank)
  }
  const code =
    base +
    period * suit +
    (typeof rank !== "number" ? parseInt(rank as string) : rank)
  return String.fromCodePoint(code)
}

export type Card = {
  suit: Suit
  rank: string | number
}

/**
 * Creates the initial card permutation.
 */
const ranks = range(2, 11)
  .map((num) => num.toString())
  .concat(letters.toSpliced(1, 1))
const initialCards: Card[] = []
for (let suit = Suit.Spades; suit <= Suit.Clubs; suit++) {
  ranks.forEach((rank) => {
    initialCards.push({
      suit,
      rank,
    })
  })
}
initialCards.forEach((card, i) => {
  const randomIndex = random(0, i)
  const temp = card
  initialCards[i] = initialCards[randomIndex]
  initialCards[randomIndex] = temp
})
export { initialCards }

/* Keeps track of the current button action. */
export enum ButtonRound {
  Deal,
  PlayCard,
  Reset,
}
