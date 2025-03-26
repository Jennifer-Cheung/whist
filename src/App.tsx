import { useState } from "react"
import { State } from "./Controller"
import styles from "./App.module.scss"

function App() {
	// Big object for storing game states
	const [state, setState] = useState(() => new State())
	const [showGame, setShowGame] = useState(false)

	const startGame = () => {
		setShowGame(true)
	}

	const showRules = () => {
		// Implement rules modal or navigation to rules page
		console.log("Show rules")
	}

	return (
		<div className={styles.container}>
			<div className={`${styles["title-screen"]} ${showGame ? styles.hidden : ''}`}>
				<div className={styles["title-content"]}>
					<h1 className={styles["game-title"]}>German Whist</h1>

					<div className={styles["menu-buttons"]}>
						<button className={styles["start-button"]} onClick={startGame}>
							Start Game
						</button>
						<button className={styles["rules-button"]} onClick={showRules}>
							<span className={styles["info-icon"]}>ⓘ</span> How To Play
						</button>
					</div>
				</div>
			</div>

			<div className={`${styles["game-container"]} ${!showGame ? styles.hidden : ''}`}>
				<div className={styles.scoreBoard}>
					<p className={styles.scoreCard}>Player <br /> {state.getMyScore()}</p>
					<span>:</span>
					<p className={styles.scoreCard}>Computer <br /> {state.getOpponentScore()}</p>
				</div>


			</div>
		</div>
	)
}

export default App
