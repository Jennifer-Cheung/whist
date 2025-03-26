import { getUnicodeCard } from "../../utils"
import { Suit } from "../../types"
import styles from "./Card.module.scss"
import { motion } from "framer-motion"

type CardProps = {
  suit?: Suit
  rank?: number | string
  flipped?: boolean
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const Card = ({
  suit,
  rank,
  flipped = false,
  onClick,
  className = "",
  disabled = false,
}: CardProps) => {
  if (flipped) {
    return (
      <motion.div
        layoutId={`${suit}${rank}`}
        layout
        onClick={onClick}
        className={className}
      >
        <span className={`${styles.card} ${styles.flipped}`}>
          {String.fromCodePoint(127136)}
        </span>
      </motion.div>
    )
  } else {
    return (
      <motion.div
        layoutId={`${suit}${rank}`}
        layout
        onClick={onClick}
        className={className}
      >
        <span
          className={`
						${styles.card} 
						${suit === Suit.Diamonds || suit === Suit.Hearts ? styles.red : ""}
						${disabled ? styles.disabled : ""}
					`}
        >
          {getUnicodeCard(suit!, rank!)}
        </span>
      </motion.div>
    )
  }
}

export default Card
