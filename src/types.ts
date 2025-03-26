export type Card = {
  suit: Suit
  rank: string
}

/**
 * The four suits
 */
export enum Suit {
  Spades,
  Hearts,
  Diamonds,
  Clubs,
}

export type GameState = "win" | "lose" | "tie" | "unfinished"

export enum Player {
  Player,
  Opponent,
}
