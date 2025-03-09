import { useCallback, useEffect, useState } from 'react'
import { ButtonRound, shuffledDeck, rankBiggerThan, shuffleDeck, Suit, type Card as CardType, Player, getSuitName } from './utils'
import styles from './App.module.scss'
import Card from './components/Card/Card'
import { random } from 'lodash'

function App() {
	const [pool, setPool] = useState<CardType[]>(shuffledDeck)
	const [deckCard, setDeckCard] = useState<CardType>()
	const [myHand, setMyHand] = useState<CardType[]>([])
	const [opponentsHand, setOpponentsHand] = useState<CardType[]>([])
	const [chosenCardIndex, setChosenCardIndex] = useState<number>()
	const [trumpSuit, setTrumpSuit] = useState<number>()
	const [actionRound, setActionRound] = useState<ButtonRound>(0)
	const [arenaCards, setArenaCards] = useState<CardType[]>([])
	const [count, setCount] = useState<number>(0)
	const [myScore, setMyScore] = useState<number>(0)
	const [opponentScore, setOpponentScore] = useState<number>(0)
	const [gameEnds, setGameEnds] = useState<boolean>(false)
	const [currentSuit, setCurrentSuit] = useState<number>()
	const [lastWinner, setLastWinner] = useState<Player>(Player.Human)

	const revealDeck = useCallback(() => {
		const newPool = [...pool]
		newPool.splice(0, 1)
		setPool(newPool)
		setDeckCard(pool[0])
		if (pool.length === 52) {
			setTrumpSuit(pool[0].suit)
		}
	}, [pool])

	useEffect(() => {
		if (pool.length > 0) {
			revealDeck()
		}
	}, [count, gameEnds])

	const deal = useCallback(() => {
		const newPool = [...pool]
		const myNewHand = newPool.splice(0, 13)
		const opponentsNewHand = newPool.splice(0, 13)
		setMyHand(myNewHand)
		setOpponentsHand(opponentsNewHand)
		setPool(newPool)
	}, [pool])

	const handleCardOnClick = useCallback((index: number) => {
		setChosenCardIndex(index)
	}, [])

	const myTurn = useCallback(() => {
		// My hand
		const chosenCard = myHand[chosenCardIndex!]
		const myNewHand = [...myHand]
		myNewHand.splice(chosenCardIndex!, 1)
		setMyHand(myNewHand)
		setChosenCardIndex(undefined)
		if (lastWinner === Player.Human) {
			setCurrentSuit(chosenCard.suit)
		}
		return chosenCard
	}, [chosenCardIndex, myHand, lastWinner])

	const opponentsTurn = (newHand: CardType[] = []) => {
		// Opponent's hand
		if (newHand.length === 0) {
			const randomIndex = random(0, opponentsHand.length - 1)
			const chosenCard = opponentsHand[randomIndex]
			const opponentsNewHand = [...opponentsHand]
			opponentsNewHand.splice(randomIndex, 1)
			setOpponentsHand(opponentsNewHand)
			if (lastWinner === Player.Computer) {
				setCurrentSuit(chosenCard.suit)
			}
			return chosenCard
		} else {
			const randomIndex = random(0, newHand.length - 1)
			const chosenCard = newHand[randomIndex]
			const opponentsNewHand = [...newHand]
			opponentsNewHand.splice(randomIndex, 1)
			setOpponentsHand(opponentsNewHand)
			if (lastWinner === Player.Computer) {
				setCurrentSuit(chosenCard.suit)
			}
			return chosenCard
		}
	}

	/**
	 * Returns success if a card is chosen first, error if unsuccessful
	 */
	const playCard = useCallback(() => {
		if (chosenCardIndex !== undefined && lastWinner === Player.Human) {
			const chosenCard = myTurn()
			const opponentsCard = opponentsTurn()
			setArenaCards([chosenCard].concat([opponentsCard]))
		} else if (chosenCardIndex !== undefined && lastWinner === Player.Computer) {
			const chosenCard = myTurn()

			setArenaCards([...arenaCards].concat([chosenCard]))
		}
	}, [chosenCardIndex, myHand, opponentsHand, arenaCards, lastWinner])

	const compare = useCallback(() => {
		if (arenaCards[0].suit === trumpSuit && arenaCards[1].suit !== trumpSuit) {
			return lastWinner === Player.Human
		} else if (arenaCards[1].suit === trumpSuit && arenaCards[0].suit !== trumpSuit) {
			return lastWinner !== Player.Human
		}
		if (!rankBiggerThan(arenaCards[1].rank, arenaCards[0].rank)) {
			return lastWinner === Player.Human
		} else {
			return lastWinner !== Player.Human
		}
	}, [arenaCards])

	/* Compare cards and distribute the top 2 cards of the deck. */
	useEffect(() => {
		if (arenaCards.length === 2) {
			const compareResult = compare()
			setTimeout(() => {
				if (deckCard && pool.length > 0) {
					if (compareResult) {
						// Human wins this round
						const myNewHand = [...myHand]
						myNewHand.push(deckCard)
						setMyHand(myNewHand)

						const opponentsNewHand = [...opponentsHand]
						opponentsNewHand.push(pool[0])
						setOpponentsHand(opponentsNewHand)
						setPool([...pool].slice(1))
						setArenaCards([])
						setLastWinner(Player.Human)
					} else {
						// Computer wins this round
						const opponentsNewHand = [...opponentsHand]
						opponentsNewHand.push(deckCard)
						setOpponentsHand(opponentsNewHand)

						const myNewHand = [...myHand]
						myNewHand.push(pool[0])
						setMyHand(myNewHand)
						setPool([...pool].slice(1))

						const opponentsCard = opponentsTurn(opponentsNewHand)

						setArenaCards([opponentsCard])
						setLastWinner(Player.Computer)
					}

					if (pool.length > 1) {
						setCount(count + 1)
					}
				}
				if (compareResult) {
					setMyScore(myScore + 1)
					setLastWinner(Player.Human)
					if (pool.length === 0) {
						setArenaCards([])
					}
				} else {
					setOpponentScore(opponentScore + 1)
					setLastWinner(Player.Computer)
					if (pool.length === 0) {
						const opponentsCard = opponentsTurn([...opponentsHand])
						setArenaCards([opponentsCard])
					}
				}


				/* Game end condition */
				if (myHand.length === 0 && arenaCards.length > 0) {
					setActionRound(ButtonRound.Reset)
					setGameEnds(true)
				}
			}, 1000)
		}
	}, [arenaCards])

	const reset = useCallback(() => {
		setPool(shuffleDeck())
		setActionRound(ButtonRound.Deal)
		setGameEnds(false)
		setMyScore(0)
		setOpponentScore(0)
		setArenaCards([])
	}, [])

	const handleNextStep = () => {
		if (actionRound === ButtonRound.Deal) {
			deal()
			setActionRound(ButtonRound.PlayCard)
		} else if (actionRound === ButtonRound.PlayCard) {
			playCard()
		} else {
			reset()
		}
	}

	return (
		<div className={styles.container}>
			{/* Scores */}
			<span>{`My score: ${myScore}    Opponent's score: ${opponentScore}`}</span>
			{gameEnds
				? <span>{myScore > opponentScore ? 'You won! :D' : (myScore < opponentScore ? 'You lost! :(' : 'You tied! :)')}</span>
				: (trumpSuit !== undefined ? `Trump suit: ${getSuitName(trumpSuit)}` : '')
			}

			{/* Deck */}
			{pool.length > 0
				? <Card suit={deckCard ? deckCard.suit : Suit.Diamonds} rank={deckCard ? deckCard.rank : 7} />
				: ''
			}

			{/* Opponent's hand */}
			<div className={styles.hand}>
				{opponentsHand.map((card, i) => (
					<Card suit={card.suit} rank={card.rank} key={i} />
				))}
			</div>

			{/* Arena */}
			<div className={styles.arena}>
				{arenaCards.map((card, i) => (
					<Card suit={card.suit} rank={card.rank} key={i} />
				))}
			</div>

			{/* My hand */}
			<div className={styles.hand}>
				{myHand.map((card, i) => (
					<Card
						suit={card.suit}
						rank={card.rank}
						key={i}
						onClick={() => { handleCardOnClick(i) }}
						isChosen={chosenCardIndex === i}
					/>
				))}
			</div>

			{/* Message */}

			{/* Action button */}
			<button onClick={handleNextStep}>{
				actionRound === ButtonRound.Deal ? 'START GAME'
					: (actionRound === ButtonRound.PlayCard ? 'PLAY' : 'RESET')
			}</button>
		</div>
	)
}

export default App
