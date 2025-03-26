import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { State } from "../Controller"
import { Card, Player, Suit } from "../types"
import { vi } from "vitest"
import { cardToIndex } from "../utils"

const createOrderedDeck = (): Card[] => {
  const suits = [Suit.Spades, Suit.Hearts, Suit.Diamonds, Suit.Clubs]
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ]
  const deck: Card[] = []

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

describe("State", () => {
  let state: State

  beforeEach(() => {
    state = new State()
  })

  describe("initialization", () => {
    it("should initialize with correct hand sizes", () => {
      expect(state.myHand).toHaveLength(13)
      expect(state.opponentHand).toHaveLength(13)
      expect(state.deck).toHaveLength(26)
    })

    it("should initialize with zero scores", () => {
      expect(state.getMyScore()).toBe(0)
      expect(state.getOpponentScore()).toBe(0)
    })

    it("should initialize with empty trick area", () => {
      expect(state.trickArea).toHaveLength(0)
    })

    it("should set trump suit from first card in deck", () => {
      expect(state.trumpSuit).toBe(state.getFirstCard().suit)
    })
  })

  describe("getFirstCard", () => {
    it("should return the first card of the deck", () => {
      const firstCard = state.getFirstCard()
      expect(firstCard).toBeDefined()
      expect(firstCard).toHaveProperty("suit")
      expect(firstCard).toHaveProperty("rank")
    })
  })

  describe("getGameState", () => {
    it('should return "unfinished" when game starts', () => {
      expect(state.getGameState()).toBe("unfinished")
    })

    it('should return "win" when player has higher score and no cards left', () => {
      state.myHand = []
      state.opponentHand = []
      state.myScore = 7
      state.opponentScore = 6
      expect(state.getGameState()).toBe("win")
    })

    it('should return "lose" when opponent has higher score and no cards left', () => {
      state.myHand = []
      state.opponentHand = []
      state.myScore = 6
      state.opponentScore = 7
      expect(state.getGameState()).toBe("lose")
    })

    it('should return "tie" when scores are equal and no cards left', () => {
      state.myHand = []
      state.opponentHand = []
      state.myScore = 6
      state.opponentScore = 6
      expect(state.getGameState()).toBe("tie")
    })
  })

  describe("getLeadingSuit", () => {
    it("should return undefined when trick area is empty", () => {
      expect(state.getLeadingSuit()).toBeUndefined()
    })

    it("should return suit of first card in trick area", () => {
      const card: Card = { suit: Suit.Hearts, rank: "A" }
      state.trickArea = [card]
      expect(state.getLeadingSuit()).toBe(Suit.Hearts)
    })
  })

  describe("initialization with ordered deck", () => {
    beforeEach(() => {
      vi.mock("../utils", async () => {
        const actual = await vi.importActual("../utils")
        return {
          ...(actual as object),
          shuffleDeck: () => createOrderedDeck(),
        }
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it("should correctly distribute cards when using ordered deck", () => {
      const newState = new State()

      // First 13 cards should be player's hand (all Spades)
      expect(newState.myHand).toEqual(
        ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"].map(
          (rank) => ({
            suit: Suit.Spades,
            rank,
          })
        )
      )

      // Next 13 cards should be opponent's hand (all Hearts)
      expect(newState.opponentHand).toEqual(
        ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"].map(
          (rank) => ({
            suit: Suit.Hearts,
            rank,
          })
        )
      )

      // First card of remaining deck should be Diamonds 2
      expect(newState.deck[0]).toEqual({
        suit: Suit.Diamonds,
        rank: "2",
      })
    })

    it("should initialize probability vector correctly with ordered deck", () => {
      const newState = new State()

      // For each card in opponent's hand and first trump card
      const knownCards = [...newState.opponentHand, newState.deck[0]]
      knownCards.forEach((card) => {
        const index = cardToIndex(card)
        expect(newState.probabilityVector[index]).toBe(0)
      })

      // Count non-zero probabilities
      const nonZeroProbabilities = newState.probabilityVector.filter(
        (p) => p > 0
      )

      // Should have 13 cards worth of probability (player's hand size)
      const totalProbability = newState.probabilityVector.reduce(
        (sum, p) => sum + p,
        0
      )
      expect(totalProbability).toBeCloseTo(13)

      // Each unknown card should have equal probability
      const expectedProbability = 13 / nonZeroProbabilities.length
      nonZeroProbabilities.forEach((p) => {
        expect(p).toBeCloseTo(expectedProbability)
      })
    })

    it("should correctly identify trump suit from first card of ordered deck", () => {
      const newState = new State()
      expect(newState.trumpSuit).toBe(Suit.Diamonds) // First card in deck will be Diamonds 2
    })

    it("should correctly initialize indexOnHand and indexNotOnHand arrays", () => {
      const newState = new State()

      // Initially, only opponent's cards and first trump card should be in indexNotOnHand
      const expectedNotOnHand = [
        ...newState.opponentHand,
        newState.deck[0],
      ].map((card) => cardToIndex(card))
      expect(newState.indexNotOnHand.sort((a, b) => a - b)).toEqual(
        expectedNotOnHand.sort((a, b) => a - b)
      )

      // Initially, no cards should be in indexOnHand
      expect(newState.indexOnHand).toHaveLength(0)
    })
  })

  describe("updateProbabilityVector", () => {
    beforeEach(() => {
      vi.mock("../utils", async () => {
        const actual = await vi.importActual("../utils")
        return {
          ...(actual as object),
          shuffleDeck: () => createOrderedDeck(),
        }
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it("should set probability to 1 for known cards on hand", () => {
      const state = new State()
      const knownCard = { suit: Suit.Diamonds, rank: "K" }

      state.updateProbabilityVector({
        cardsOnHand: [knownCard],
        cardsNotOnHand: [],
      })

      const cardIndex = cardToIndex(knownCard)
      expect(state.probabilityVector[cardIndex]).toBe(1)
    })

    it("should set probability to 0 for cards known to not be on hand", () => {
      const state = new State()
      const notOnHandCard = { suit: Suit.Clubs, rank: "2" }

      state.updateProbabilityVector({
        cardsOnHand: [],
        cardsNotOnHand: [notOnHandCard],
      })

      const cardIndex = cardToIndex(notOnHandCard)
      expect(state.probabilityVector[cardIndex]).toBe(0)
    })

    it("should distribute remaining probability equally among unknown cards", () => {
      const state = new State()
      const knownCards = [
        { suit: Suit.Diamonds, rank: "K" },
        { suit: Suit.Diamonds, rank: "Q" },
      ]
      const notOnHandCards = [
        { suit: Suit.Clubs, rank: "2" },
        { suit: Suit.Clubs, rank: "3" },
      ]

      state.updateProbabilityVector({
        cardsOnHand: knownCards,
        cardsNotOnHand: notOnHandCards,
      })

      // Count cards with non-zero probability
      const unknownCards = state.probabilityVector.filter((p) => p > 0 && p < 1)
      const remainingProbability = 13 - knownCards.length // Total cards in hand minus known cards
      const expectedProbability = remainingProbability / unknownCards.length

      unknownCards.forEach((prob) => {
        expect(prob).toBeCloseTo(expectedProbability)
      })
    })

    it("should maintain total probability equal to hand size", () => {
      const state = new State()
      const knownCards = [
        { suit: Suit.Diamonds, rank: "K" },
        { suit: Suit.Diamonds, rank: "Q" },
      ]
      const notOnHandCards = [
        { suit: Suit.Clubs, rank: "2" },
        { suit: Suit.Clubs, rank: "3" },
      ]

      state.updateProbabilityVector({
        cardsOnHand: knownCards,
        cardsNotOnHand: notOnHandCards,
      })

      const totalProbability = state.probabilityVector.reduce(
        (sum, p) => sum + p,
        0
      )
      expect(totalProbability).toBeCloseTo(13) // Hand size
    })

    it("should update indexOnHand and indexNotOnHand arrays", () => {
      const state = new State()
      const knownCards = [
        { suit: Suit.Diamonds, rank: "K" },
        { suit: Suit.Diamonds, rank: "Q" },
      ]
      const notOnHandCards = [
        { suit: Suit.Clubs, rank: "2" },
        { suit: Suit.Clubs, rank: "3" },
      ]

      state.updateProbabilityVector({
        cardsOnHand: knownCards,
        cardsNotOnHand: notOnHandCards,
      })

      const expectedOnHand = knownCards.map((card) => cardToIndex(card))
      const expectedNotOnHand = notOnHandCards.map((card) => cardToIndex(card))

      expect(state.indexOnHand.sort((a, b) => a - b)).toEqual(
        expectedOnHand.sort((a, b) => a - b)
      )
      expect(state.indexNotOnHand.sort((a, b) => a - b)).toEqual(
        expect.arrayContaining(expectedNotOnHand)
      )
    })

    it("should handle empty updates correctly", () => {
      const state = new State()
      const initialProbabilityVector = [...state.probabilityVector]

      state.updateProbabilityVector({
        cardsOnHand: [],
        cardsNotOnHand: [],
      })

      expect(state.probabilityVector).toEqual(initialProbabilityVector)
    })
  })

  describe("opponentTurn", () => {
    beforeEach(() => {
      vi.mock("../utils", async () => {
        const actual = await vi.importActual("../utils")
        return {
          ...(actual as object),
          shuffleDeck: () => createOrderedDeck(),
        }
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    describe("when following lead", () => {
      it("should play the smallest winning card possible", () => {
        const state = new State()
        state.leadingPlayer = Player.Player
        state.trickArea = [{ suit: Suit.Hearts, rank: "7" }]
        state.opponentHand = [
          { suit: Suit.Hearts, rank: "6" },
          { suit: Suit.Hearts, rank: "8" },
          { suit: Suit.Hearts, rank: "K" },
        ]

        state.opponentTurn()

        expect(state.trickArea[1]).toEqual({ suit: Suit.Hearts, rank: "8" })
      })

      it("should play the smallest card when cannot win (can follow suit)", () => {
        const state = new State()
        state.leadingPlayer = Player.Player
        state.trumpSuit = Suit.Spades
        state.trickArea = [{ suit: Suit.Spades, rank: "9" }]
        state.opponentHand = [
          { suit: Suit.Diamonds, rank: "K" },
          { suit: Suit.Spades, rank: "2" },
          { suit: Suit.Spades, rank: "3" },
        ]

        state.opponentTurn()

        expect(state.trickArea[1]).toEqual({ suit: Suit.Spades, rank: "2" })
      })

      it("should play the smallest card when cannot win (cannot follow suit)", () => {
        const state = new State()
        state.leadingPlayer = Player.Player
        state.trumpSuit = Suit.Spades
        state.trickArea = [{ suit: Suit.Spades, rank: "9" }]
        state.opponentHand = [
          { suit: Suit.Diamonds, rank: "K" },
          { suit: Suit.Hearts, rank: "2" },
        ]

        state.opponentTurn()

        expect(state.trickArea[1]).toEqual({ suit: Suit.Hearts, rank: "2" })
      })
    })

    describe("when leading", () => {
      it("should play the smallest winning card out of the ones with >=80% winning chance", () => {
        const state = new State()
        state.leadingPlayer = Player.Opponent
        state.trumpSuit = Suit.Spades
        state.myHand = [{ suit: Suit.Hearts, rank: "A" }]
        state.opponentHand = [
          { suit: Suit.Hearts, rank: "2" },
          { suit: Suit.Hearts, rank: "K" }, // 80% chance winning
          { suit: Suit.Spades, rank: "2" }, // 100% chance winning
        ]
        state.probabilityVector = Array(52).fill(0)
        // Assume the player has equal chances of having 3, 4, 5, 6, A of Hearts
        const targetIndices = [
          { suit: Suit.Hearts, rank: "3" },
          { suit: Suit.Hearts, rank: "4" },
          { suit: Suit.Hearts, rank: "5" },
          { suit: Suit.Hearts, rank: "6" },
          { suit: Suit.Hearts, rank: "A" },
        ].map((card: Card) => cardToIndex(card))
        state.probabilityVector.forEach((_, index) => {
          if (targetIndices.includes(index)) {
            state.probabilityVector[index] = 0.2
          }
        })

        state.opponentTurn()

        expect(state.trickArea[0]).toEqual({ suit: Suit.Hearts, rank: "K" })
      })

      it("should play the largest card when no card has a >=80% winning chance", () => {
        const state = new State()
        state.leadingPlayer = Player.Opponent
        state.trumpSuit = Suit.Spades
        state.myHand = [{ suit: Suit.Spades, rank: "3" }]
        state.opponentHand = [
          { suit: Suit.Spades, rank: "2" },
          { suit: Suit.Spades, rank: "10" },
        ]
        state.probabilityVector = Array(52).fill(0)
        // Assume the player has a 50% chance of holding 3 of Spades and 50% chance of holding J of Spades
        const targetIndices = [
          { suit: Suit.Spades, rank: "3" },
          { suit: Suit.Spades, rank: "J" },
        ].map((card: Card) => cardToIndex(card))
        state.probabilityVector.forEach((_, index) => {
          if (targetIndices.includes(index)) {
            state.probabilityVector[index] = 0.5
          }
        })

        state.opponentTurn()

        expect(state.trickArea[0]).toEqual({ suit: Suit.Spades, rank: "10" })
      })
    })
  })

  describe("update", () => {
    beforeEach(() => {
      vi.mock("../utils", async () => {
        const actual = await vi.importActual("../utils")
        return {
          ...(actual as object),
          shuffleDeck: () => createOrderedDeck(),
        }
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    describe("when player wins and becomes leading player", () => {
      it("should handle player winning when initially leading", () => {
        const state = new State()
        state.leadingPlayer = Player.Player
        state.myScore = 0
        state.myHand = [{ suit: Suit.Hearts, rank: "K" }]
        state.opponentHand = [{ suit: Suit.Hearts, rank: "2" }]
        state.deck = [
          { suit: Suit.Diamonds, rank: "A" },
          { suit: Suit.Clubs, rank: "K" },
        ]

        state.update(state.myHand[0])

        expect(state.trickArea).toHaveLength(0)
        expect(state.myScore).toBe(1)
        expect(state.myHand).toHaveLength(1)
        expect(state.opponentHand).toHaveLength(1)
        expect(state.leadingPlayer).toBe(Player.Player)
      })

      it("should handle player winning when initially following", () => {
        const state = new State()
        state.leadingPlayer = Player.Opponent
        state.myScore = 0
        state.myHand = [{ suit: Suit.Hearts, rank: "A" }]
        state.opponentHand = []
        state.trickArea = [{ suit: Suit.Hearts, rank: "K" }]
        state.deck = [
          { suit: Suit.Diamonds, rank: "A" },
          { suit: Suit.Clubs, rank: "K" },
        ]

        state.update(state.myHand[0])

        expect(state.trickArea).toHaveLength(0)
        expect(state.myScore).toBe(1)
        expect(state.myHand).toHaveLength(1)
        expect(state.opponentHand).toHaveLength(1)
        expect(state.leadingPlayer).toBe(Player.Player)
      })
    })

    describe("when opponent wins and becomes leading player", () => {
      it("should handle opponent winning when player initially leading", () => {
        const state = new State()
        state.leadingPlayer = Player.Player
        state.opponentScore = 0
        state.myHand = [{ suit: Suit.Hearts, rank: "2" }]
        state.opponentHand = [{ suit: Suit.Hearts, rank: "A" }]
        state.deck = [
          { suit: Suit.Diamonds, rank: "A" },
          { suit: Suit.Clubs, rank: "K" },
        ]

        state.update(state.myHand[0])

        expect(state.trickArea).toHaveLength(1)
        expect(state.opponentScore).toBe(1)
        expect(state.myHand).toHaveLength(1)
        expect(state.opponentHand).toHaveLength(0)
        expect(state.leadingPlayer).toBe(Player.Opponent)
      })

      it("should handle opponent winning when initially leading", () => {
        const state = new State()
        state.leadingPlayer = Player.Opponent
        state.opponentScore = 0
        state.myHand = [{ suit: Suit.Hearts, rank: "2" }]
        state.opponentHand = []
        state.trickArea = [{ suit: Suit.Hearts, rank: "K" }]
        state.deck = [
          { suit: Suit.Diamonds, rank: "A" },
          { suit: Suit.Clubs, rank: "K" },
        ]

        state.update(state.myHand[0])

        expect(state.trickArea).toHaveLength(1)
        expect(state.opponentScore).toBe(1)
        expect(state.myHand).toHaveLength(1)
        expect(state.opponentHand).toHaveLength(0)
        expect(state.leadingPlayer).toBe(Player.Opponent)
      })
    })
  })
})
