import { random, range, toInteger } from "lodash"
import { Card, Suit } from "./types"

const letters = ["J", "C", "Q", "K", "A"]
export const isNumber = (s: string) => {
  return letters.indexOf(s) === -1
}

/**
 * Regardless of suits, returns whether the first card is bigger than the second card
 * @param rank1 The rank of the first card
 * @param rank2 The rank of the second card
 * @returns whether the first rank is bigger than the second rank
 */
export const rankBiggerThan = (rank1: string, rank2: string) => {
  if (isNumber(rank1) && isNumber(rank2)) {
    return toInteger(rank1) >= toInteger(rank2)
  } else if (!isNumber(rank1) && !isNumber(rank2)) {
    return letters.indexOf(rank1) >= letters.indexOf(rank2)
  } else {
    return isNumber(rank2)
  }
}

/**
 * Returns if the first card is bigger than the second card. Assume the first card is the leading card, and the suit is correctly followed.
 * Note that no two cards are considered equal.
 * @param card1 The first card in the trick area
 * @param card2 The second card in the trick area
 * @param trumpSuit The trump suit of the game
 * @returns Whether the first card is bigger than the second card
 */
export const cardBiggerThan = (
  card1: Card,
  card2: Card,
  trumpSuit: Suit
): boolean => {
  // Player 2 cannot follow suit
  if (card1.suit !== card2.suit && card2.suit !== trumpSuit) {
    return true
  }

  // Player 1 did not play the trump suit, but Player 2 played and wins
  if (
    card1.suit !== card2.suit &&
    card1.suit !== trumpSuit &&
    card2.suit === trumpSuit
  ) {
    return false
  }

  // They have the same suit and are compared by the rank
  return rankBiggerThan(card1.rank, card2.rank)
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

/**
 * Creates the initial card permutation.
 */
export const shuffleDeck = (): Card[] => {
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
  return initialCards
}

/* Keeps track of the current button action. */
export enum ButtonRound {
  Deal,
  PlayCard,
  Reset,
}

export enum Player {
  Human,
  Computer,
}

export const getSuitName = (suit: Suit) => {
  if (suit === Suit.Clubs) {
    return "Clubs"
  } else if (suit === Suit.Diamonds) {
    return "Diamonds"
  } else if (suit === Suit.Hearts) {
    return "Hearts"
  } else {
    return "Spades"
  }
}

/**
 * Returns the offset to be used in the probability vector
 * @param card The card to be turned into an index
 */
export const cardToIndex = (card: Card): number => {
  if (isNumber(card.rank)) {
    return card.suit * 13 + +card.rank - 1
  } else {
    switch (card.rank) {
      case "J":
        return card.suit * 13 + 11 - 1
      case "Q":
        return card.suit * 13 + 12 - 1
      case "K":
        return card.suit * 13 + 13 - 1
      default:
        return card.suit * 13
    }
  }
}

/**
 * Return the card corresponding to the position in the probability vector
 * @param index - Index of a card in the probability vector
 */
export const indexToCard = (index: number): Card => {
  const suit: Suit = Math.floor(index / 13)
  const offset = index % 13
  let rank: string = ""
  if (offset === 0) {
    rank = "A"
  } else if (offset < 10) {
    rank = (offset + 1).toString()
  } else {
    switch (offset) {
      case 10:
        rank = "J"
        break
      case 11:
        rank = "Q"
        break
      default:
        rank = "K"
    }
  }
  return { suit, rank }
}

export const getSuitSymbol = (suit: Suit) => {
  switch (suit) {
    case Suit.Clubs:
      return "♧"
    case Suit.Diamonds:
      return "♢"
    case Suit.Hearts:
      return "♡"
    default:
      return "♤"
  }
}
