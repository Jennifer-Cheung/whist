import { getUnicodeCard, Suit } from "../../utils"
import styles from './Card.module.scss'

type CardProps = {
    suit?: Suit,
    rank?: number | string,
    flipped?: boolean
}

const Card = ({ suit, rank, flipped=false }: CardProps) => {
    if (flipped) {
        return (<span className={styles.card}>{String.fromCodePoint(127136)}</span>)
    } else {
        return (<span className={styles.card}>{getUnicodeCard(suit!, rank!)}</span>)
    }
}

export default Card
