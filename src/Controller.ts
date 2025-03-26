import { shuffleDeck, cardBiggerThan, cardToIndex, indexToCard } from "./utils"
import { Player, type Card, type GameState, Suit } from "./types"

/**
 * Notes for myself:
 * - the state object changes on every update, and the card the player chooses determines the next state
 *
 * Getters:
 * - get the first card of the deck
 * - get the current game state (win/lose/tie/unfinished)
 *
 * Setters:
 * - Update
 *
 * Private methods:
 * - opponentTurn
 */

export class State {
  myHand: Card[]
  opponentHand: Card[]
  deck: Card[]
  myScore: number
  opponentScore: number
  trickArea: Card[] // The two cards played in a round, contribute to one trick
  trumpSuit: Suit

  leadingPlayer: Player
  probabilityVector: number[] // Keeps track of what cards the computer guesses that the player has, ranging from [spades] A..K, [hearts] ..., [diamonds] ..., [clubs] ...

  /* These two can only be modified in updateProbabilityVector() */
  indexOnHand: number[] // Cards that the opponent knows that the player holds
  indexNotOnHand: number[] // Cards that the opponent knows that the player does not hold

  /**
   * Initialize the states. Both hands are dealt before the first card of the deck is revealed.
   */
  constructor() {
    const shuffledDeck = [...shuffleDeck()]
    this.myHand = shuffledDeck.splice(0, 13)
    this.opponentHand = shuffledDeck.splice(0, 13)
    this.deck = shuffledDeck
    this.myScore = 0
    this.opponentScore = 0
    this.trickArea = []
    this.trumpSuit = this.deck[0].suit
    this.leadingPlayer = Player.Player
    this.probabilityVector = Array(52).fill(13 / 52)
    this.indexOnHand = []
    this.indexNotOnHand = []
    this.updateProbabilityVector({
      cardsNotOnHand: [this.deck[0], ...this.opponentHand],
      cardsOnHand: [],
    })
  }

  /**
   * Get the first card of the deck.
   * @returns This first card of the deck
   */
  getFirstCard(): Card {
    return this.deck[0]
  }

  getMyScore(): number {
    return this.myScore
  }

  getOpponentScore(): number {
    return this.opponentScore
  }

  /**
   * Get the current game state.
   * @returns The current game state
   */
  getGameState(): GameState {
    if (this.myHand.length !== 0 || this.opponentHand.length !== 0) {
      return "unfinished"
    } else {
      if (this.myScore > this.opponentScore) {
        return "win"
      } else if (this.myScore < this.opponentScore) {
        return "lose"
      } else {
        return "tie"
      }
    }
  }

  getLeadingSuit(): Suit | undefined {
    if (this.trickArea.length >= 1) {
      return this.trickArea[0].suit
    }
  }

  getTrumpSuit(): Suit {
    return this.trumpSuit
  }

  getDeck(): Card[] {
    return this.deck
  }

  getMyHand(): Card[] {
    return this.myHand
  }

  getOpponentHand(): Card[] {
    return this.opponentHand
  }

  getTrickArea(): Card[] {
    return this.trickArea
  }

  /**
   * Notes for myself:
   * There are two scenarios: if the player has won in the previous round, the player gets to play the first card of the trick
   * and set the current suit; if the opponent has won, then they get to pick the suit and play the first card of the trick.
   *
   * After two players have played and the trick is completed, the two cards are compared and the winner of this round is determined.
   *
   * If the opponent has won this round, they get to play another card and determines the leading suit of the next round.
   */

  /**
   * Update the states based on the card the player chooses. Assume that they chosen card follows suit correctly.
   * @param {Card} chosenCard - The card chosen by the player in this round
   */
  update(chosenCard: Card): State {
    const newState = new State()
    // Copy all current state
    Object.assign(newState, this)
    // Create new arrays to avoid reference issues
    newState.myHand = [...this.myHand]
    newState.opponentHand = [...this.opponentHand]
    newState.deck = [...this.deck]
    newState.trickArea = [...this.trickArea]
    newState.indexOnHand = [...this.indexOnHand]
    newState.indexNotOnHand = [...this.indexNotOnHand]
    newState.probabilityVector = [...this.probabilityVector]

    newState.playerPlayCard(chosenCard)
    if (newState.leadingPlayer === Player.Player) {
      newState.updateProbabilityVector({
        cardsNotOnHand: [newState.trickArea[0]],
        cardsOnHand: [],
      })
      newState.opponentTurn()
    } else {
      newState.updateProbabilityVector({
        cardsNotOnHand: [newState.trickArea[1]],
        cardsOnHand: [],
      })
    }

    const getOppositePlayer = (): Player => {
      if (newState.leadingPlayer === Player.Player) {
        return Player.Opponent
      } else {
        return Player.Player
      }
    }

    // Compare and update scores
    const winner: Player = cardBiggerThan(
      newState.trickArea[0],
      newState.trickArea[1],
      newState.trumpSuit
    )
      ? newState.leadingPlayer
      : getOppositePlayer()
    if (winner === Player.Player) {
      newState.myScore++
      newState.leadingPlayer = Player.Player
      newState.trickArea = []
      if (newState.deck.length > 0) {
        const firstCard = newState.deck.splice(0, 1)[0]
        const secondCard = newState.deck.splice(0, 1)[0]
        newState.myHand.push(firstCard)
        newState.opponentHand.push(secondCard)
        newState.updateProbabilityVector({
          cardsOnHand: [firstCard],
          cardsNotOnHand: [secondCard],
        })
      }
    } else {
      newState.opponentScore++
      newState.leadingPlayer = Player.Opponent
      newState.trickArea = []
      if (newState.deck.length > 0) {
        const firstCard = newState.deck.splice(0, 1)[0]
        const secondCard = newState.deck.splice(0, 1)[0]
        newState.opponentHand.push(firstCard)
        newState.myHand.push(secondCard)
        newState.updateProbabilityVector({
          cardsNotOnHand: [firstCard],
          cardsOnHand: [],
        })
      }
      if (this.opponentHand.length > 0) {
        newState.opponentTurn()
      }
    }

    return newState
  }

  opponentPlayCard(card: Card) {
    this.opponentHand.splice(
      this.opponentHand.findIndex(
        (handCard) => handCard.suit === card.suit && handCard.rank === card.rank
      ),
      1
    )
    this.trickArea.push(card)
  }

  playerPlayCard(card: Card) {
    this.myHand.splice(
      this.myHand.findIndex(
        (handCard) => handCard.suit === card.suit && handCard.rank === card.rank
      ),
      1
    )
    this.trickArea.push(card)
  }

  opponentTurn(): void {
    if (this.leadingPlayer === Player.Player) {
      const availableCards = this.opponentHand.filter(
        (card) => card.suit === this.getLeadingSuit()
      )

      if (availableCards.length > 0) {
        // Play the smallest card that can beat the player. Sort the available cards in ascending order
        availableCards.sort((card1, card2) =>
          cardBiggerThan(card1, card2, this.trumpSuit) ? 1 : -1
        )

        for (const card of availableCards) {
          if (cardBiggerThan(card, this.trickArea[0], this.trumpSuit)) {
            this.opponentPlayCard(card)
            return
          }
        }

        // Can follow suit but no cards can beat the player. Play the smallest card possible.
        this.opponentPlayCard(availableCards[0])
        return
      } else {
        // Cannot follow suit. If a trump suit is present, play the smallest card of all. Otherwise, play the smallest card.
        const orderedCards = [...this.opponentHand].sort((card1, card2) =>
          cardBiggerThan(card1, card2, this.trumpSuit) ? 1 : -1
        )
        if (orderedCards.some((card) => card.suit === this.trumpSuit)) {
          for (const card of orderedCards) {
            if (card.suit === this.trumpSuit) {
              this.opponentPlayCard(card)
              return
            }
          }
        }
        this.opponentPlayCard(orderedCards[0])
        return
      }
    } else {
      // Calculate the probability of winning for each card. Play the smallest card with >=80% chance of winning.
      // Otherwise, play the one with the highest probability. If multiple occur, randomly choose one.
      // Calculate a winningProbabilities vector and sort it in ascending order. Check the probability one by one.
      const winningProbabilities = this.opponentHand.map((card) => {
        // The probability of winning with this card = 1 / (no. of cards player has) * Weighted sum
        const weightedSum = this.probabilityVector.reduce(
          (sum, currentProbability, index) =>
            sum +
            currentProbability *
              (cardBiggerThan(card, indexToCard(index), this.trumpSuit)
                ? 1
                : 0),
          0
        )
        return (1 / this.myHand.length) * weightedSum
      })

      const sortedProbabilityPairs: { probability: number; index: number }[] =
        winningProbabilities
          .map((probability, index) => ({
            probability,
            index,
          }))
          .sort((pair1, pair2) =>
            pair1.probability <= pair2.probability ? -1 : 1
          )

      const targetPair = sortedProbabilityPairs.find(
        (pair) => pair.probability >= 0.8
      )
      if (targetPair !== undefined) {
        this.opponentPlayCard(this.opponentHand[targetPair.index])
      } else {
        this.opponentPlayCard(
          this.opponentHand[
            sortedProbabilityPairs[sortedProbabilityPairs.length - 1].index
          ]
        )
      }
    }
  }

  /**
   * Update the probability vector with the newly known cards from the current round. Return nothing.
   * @param cardsNotOnHand - Cards that the opponent knows which are not held by the player
   * @param cardsOnHand - Cards that the opponent knows which are held by the player
   */
  updateProbabilityVector({
    cardsOnHand = [],
    cardsNotOnHand = [],
  }: {
    cardsOnHand: Card[]
    cardsNotOnHand: Card[]
  }): void {
    cardsNotOnHand.forEach((card) => {
      const index = cardToIndex(card)
      this.indexNotOnHand.push(index)
    })
    cardsOnHand.forEach((card) => {
      const index = cardToIndex(card)
      this.indexOnHand.push(index)
    })
    let counter = 0 // Beware of divide by zero error
    const otherIndices: number[] = []
    this.probabilityVector.forEach((_, index) => {
      if (this.indexNotOnHand.includes(index)) {
        this.probabilityVector[index] = 0
      } else if (this.indexOnHand.includes(index)) {
        this.probabilityVector[index] = 1
      } else {
        counter++
        otherIndices.push(index)
      }
    })
    if (counter !== 0) {
      otherIndices.forEach((index) => {
        this.probabilityVector[index] =
          (this.myHand.length - cardsOnHand.length) / counter
      })
    }
  }
}
