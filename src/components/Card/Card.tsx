import { getUnicodeCard, Suit } from "../../utils"
import styles from './Card.module.scss'

type CardProps = {
    suit: Suit,
    rank: number | string
}

const Card = ({ suit, rank }: CardProps) => {
    return <span className={styles.card}>{getUnicodeCard(suit, rank)}</span>
}

export default Card
