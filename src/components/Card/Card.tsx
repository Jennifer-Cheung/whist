import { getUnicodeCard } from "../../utils"
import { Suit } from "../../types"
import styles from './Card.module.scss'

type CardProps = {
    suit?: Suit,
    rank?: number | string,
    flipped?: boolean,
    onClick?: () => void,
}

const Card = ({ suit, rank, flipped = false, onClick }: CardProps) => {
    if (flipped) {
        return (<span className={styles.card}>{String.fromCodePoint(127136)}</span>)
    } else {
        return (<span className={`${styles.card} ${suit === Suit.Diamonds || suit === Suit.Hearts ? styles.red : ''}`}>{getUnicodeCard(suit!, rank!)}</span>)
    }
}

export default Card
