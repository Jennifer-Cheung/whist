import { useCallback, useEffect, useState } from 'react'
import { initialCards, Suit, type Card as CardType } from './utils'
import './App.css'
import Card from './components/Card/Card'
import { random } from 'lodash'

function App() {
	const [pool, setPool] = useState<CardType[]>(initialCards)
	const [deckCard, setDeckCard] = useState<CardType>()

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

	return (
		<div>
			{/* Deck */}
			<Card suit={deckCard ? deckCard.suit : Suit.Diamonds} rank={deckCard ? deckCard.rank : 7} />

			{/* Opponent's hand */}

			{/* Playing cards */}

			{/* My hand */}

			{/* Message */}

			{/* Action button */}
			<button onClick={revealDeck}>NEXT STEP</button>
		</div>
	)
}

export default App
