import { getUnicodeCard, Suit } from "../../utils"
import styles from './Card.module.scss'

type CardProps = {
    suit?: Suit,
    rank?: number | string,
    flipped?: boolean,
    onClick?: () => void,
    isChosen?: boolean,
}

const Card = ({ suit, rank, flipped = false, onClick, isChosen }: CardProps) => {
    return (
        <span
            className={[
                styles.card,
                isChosen ? styles.chosen : '',
            ].join(' ')}
            onClick={onClick}
        >
            {
                flipped
                    ? String.fromCodePoint(127136)
                    : getUnicodeCard(suit!, rank!)
            }
        </span>
    )
}

export default Card
