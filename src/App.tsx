import { useCallback, useEffect, useState } from 'react'
import { ButtonRound, shuffledDeck, rankBiggerThan, shuffleDeck, Suit, type Card as CardType } from './utils'
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
	}, [count])

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

	/**
	 * Returns success if a card is chosen first, error if unsuccessful
	 */
	const playCard = useCallback(() => {
		if (chosenCardIndex !== undefined) {
			// My hand
			const chosenCard = myHand[chosenCardIndex]
			const myNewHand = [...myHand]
			myNewHand.splice(chosenCardIndex, 1)
			setMyHand(myNewHand)
			setChosenCardIndex(undefined)

			// Opponent's hand
			const randomIndex = random(0, opponentsHand.length - 1)
			const opponentsCard = opponentsHand[randomIndex]
			const opponentsNewHand = [...opponentsHand]
			opponentsNewHand.splice(0, 1)
			setOpponentsHand(opponentsNewHand)
			setArenaCards([chosenCard].concat([opponentsCard]))
		}
	}, [chosenCardIndex, myHand, opponentsHand])

	const compare = useCallback(() => {
		if (arenaCards[0].suit === trumpSuit && arenaCards[1].suit !== trumpSuit) {
			return 1
		} else if (arenaCards[1].suit === trumpSuit && arenaCards[0].suit !== trumpSuit) {
			return 0
		}
		if (rankBiggerThan(arenaCards[0].rank, arenaCards[1].rank)) {
			return 1
		} else {
			return 0
		}
	}, [arenaCards])

	/* Compare cards and distribute the top 2 cards of the deck. */
	useEffect(() => {
		if (arenaCards.length === 2) {
			const compareResult = compare()
			setTimeout(() => {
				if (deckCard && pool.length > 0) {
					if (compareResult) {
						const myNewHand = [...myHand]
						myNewHand.push(deckCard)
						setMyHand(myNewHand)

						const opponentsNewHand = [...opponentsHand]
						opponentsNewHand.push(pool[0])
						setOpponentsHand(opponentsNewHand)
						setPool([...pool].slice(1))
					} else {
						const opponentsNewHand = [...opponentsHand]
						opponentsNewHand.push(deckCard)
						setOpponentsHand(opponentsNewHand)

						const myNewHand = [...myHand]
						myNewHand.push(pool[0])
						setMyHand(myNewHand)
						setPool([...pool].slice(1))
					}
					setArenaCards([])
					if (pool.length > 1) {
						setCount(count + 1)
					}
				}
				if (compareResult) {
					setMyScore(myScore + 1)
				} else {
					setOpponentScore(opponentScore + 1)
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

	/* Game end condition */
	useEffect(() => {
		if (myHand.length === 0 && arenaCards.length > 0) {
			setActionRound(ButtonRound.Reset)
			setGameEnds(true)
		}
	}, [myHand, arenaCards])

	return (
		<div className={styles.container}>
			{/* Scores */}
			<span>My score: {myScore} Opponent's score: {opponentScore}</span>
			{gameEnds
				? <span>{myScore > opponentScore ? 'You won! :D' : (myScore < opponentScore ? 'You lost! :(' : 'You tied! :)')}</span>
				: ''
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
