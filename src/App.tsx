import { useCallback, useEffect, useState } from 'react'
import { initialCards, Suit, type Card as CardType } from './utils'
import styles from './App.module.scss'
import Card from './components/Card/Card'
import { random } from 'lodash'

function App() {
	const [pool, setPool] = useState<CardType[]>(initialCards)
	const [deckCard, setDeckCard] = useState<CardType>()
	const [myHand, setMyHand] = useState<CardType[]>()

	const revealDeck = useCallback(() => {
		const randomIndex = random(0, pool.length - 1)
		const randomCard = pool[randomIndex]
		const newPool = [...pool]
		newPool.splice(randomIndex, 1)
		setPool(newPool)
		setDeckCard(randomCard)
	}, [pool])

	useEffect(() => {
		revealDeck()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const deal = useCallback(() => {
		const myIndices: number[] = []
		for (let i = 0; i < 13; i++) {
			let randomIndex = random(0, 51)
			while (myIndices.find((i) => {
				return i === randomIndex
			})) {
				randomIndex = random(0, 51)
			}
			myIndices.push(randomIndex)
		}
		const newPool = [...pool]
		const myCards = myIndices.map((index) => {
			newPool.toSpliced(index, 1)
			return pool[index]
		})
		setMyHand(myCards)
	}, [pool])

	return (
		<div className={styles.container}>
			{/* Deck */}
			<Card suit={deckCard ? deckCard.suit : Suit.Diamonds} rank={deckCard ? deckCard.rank : 7} />

			{/* Opponent's hand */}
			<div className={styles.hand}>
				{[...Array(13)].map((value, i) => (
					<Card flipped key={i} />
				))}
			</div>

			{/* Arena */}
			<div className={styles.arena}></div>

			{/* My hand */}
			<div className={styles.hand}>
				{myHand?.map((card, i) => (
					<Card suit={card.suit} rank={card.rank} key={i} />
				))}
			</div>

			{/* Message */}

			{/* Action button */}
			<button onClick={deal}>NEXT STEP</button>
		</div>
	)
}

export default App
