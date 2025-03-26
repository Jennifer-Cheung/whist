import { useEffect, useState } from "react"
import { State } from "./Controller"
import styles from "./App.module.scss"
import Card from "./components/Card/Card"
import { getSuitSymbol } from "./utils"
import { type Card as CardType, type GameState } from "./types"
import { AnimateSharedLayout } from "motion/react"

function App() {
  // Big object for storing game states
  const [state, setState] = useState(() => new State())
  const [showGame, setShowGame] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameState, setGameState] = useState<GameState>("unfinished")

  const startGame = () => {
    setShowGame(true)
  }

  const showRules = () => {
    // Implement rules modal or navigation to rules page
    console.log("Show rules")
  }

  const handleCardClick = (suit: number, rank: string) => {
    setState((prevState) => prevState.update({ suit, rank }))
  }

  useEffect(() => {
    if (state.getGameState() !== "unfinished") {
      setGameOver(true)
      setGameState(state.getGameState())
    }
  }, [state])

  const checkDisabled = (card: CardType) => {
    if (
      state.getLeadingSuit() !== undefined &&
      state.getMyHand().some((card) => card.suit === state.getLeadingSuit())
    ) {
      if (card.suit !== state.getLeadingSuit()) {
        return true
      }
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles["title-screen"]} ${showGame ? styles.hidden : ""}`}
      >
        <div className={styles["title-content"]}>
          <h1>German Whist</h1>

          <div className={styles["menu-buttons"]}>
            <button className={styles["start-button"]} onClick={startGame}>
              Start Game
            </button>
            {/* <button className={styles["rules-button"]} onClick={showRules}>
              <span className={styles["info-icon"]}>ⓘ</span> How To Play
            </button> */}
          </div>
        </div>
      </div>

      <div
        className={`${styles["game-container"]} ${
          !showGame ? styles.hidden : ""
        }`}
      >
        <div className={styles.scoreBoard}>
          <p className={styles.scoreCard}>
            Player <br /> {state.getMyScore()}
          </p>
          <span>:</span>
          <p className={styles.scoreCard}>
            Computer <br /> {state.getOpponentScore()}
          </p>
        </div>

        <span className={styles.trumpSuitMessage}>
          Trump Suit:&nbsp;&nbsp;
          <span className={styles.suitSymbol}>{`${getSuitSymbol(
            state.getTrumpSuit()
          )}`}</span>
        </span>

        <div className={styles.deck}>
          {state
            .getDeck()
            .toReversed()
            .map((card) => (
              <Card
                suit={card.suit}
                rank={card.rank}
                key={`${card.suit}${card.rank}`}
                className={styles.deckCard}
              />
            ))}
        </div>

        {!gameOver ? (
          <div className={styles.gameArea}>
            <div className={styles.hand}>
              {state.getOpponentHand().map((card) => (
                <Card
                  suit={card.suit}
                  rank={card.rank}
                  key={`${card.suit}${card.rank}`}
                  //   flipped
                />
              ))}
            </div>

            <div className={styles.trickArea}>
              {state.getTrickArea().map((card) => (
                <Card
                  suit={card.suit}
                  rank={card.rank}
                  key={`${card.suit}${card.rank}`}
                />
              ))}
            </div>

            <div className={styles.hand}>
              {state.getMyHand().map((card) => (
                <Card
                  suit={card.suit}
                  rank={card.rank}
                  key={`${card.suit}${card.rank}`}
                  onClick={
                    checkDisabled(card)
                      ? undefined
                      : () => handleCardClick(card.suit, card.rank)
                  }
                  disabled={checkDisabled(card)}
                />
              ))}
            </div>
          </div>
        ) : (
          <h1>You {gameState}!</h1>
        )}
      </div>
    </div>
  )
}

export default App
