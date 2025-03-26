import type { Meta, StoryObj } from "@storybook/react"
import Card from "../components/Card/Card"
import { Suit } from "../types"

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        {
          name: "dark",
          value: "#252525",
        },
      ],
    },
    layout: "centered",
  },
  argTypes: {
    suit: {
      control: "select",
      options: Object.values(Suit),
      description: "The suit of the card",
    },
    rank: {
      control: "select",
      options: [...Array(13)].map((_, i) => i + 1),
      description: "The rank of the card (1-13)",
    },
    flipped: {
      control: "boolean",
      description: "Whether the card is face down",
    },
    onClick: { action: "clicked" },
  },
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    suit: Suit.Hearts,
    rank: 1,
    flipped: false,
  },
}

export const Flipped: Story = {
  args: {
    suit: Suit.Hearts,
    rank: 1,
    flipped: true,
  },
}

export const BlackSuit: Story = {
  args: {
    suit: Suit.Spades,
    rank: 13,
    flipped: false,
  },
}

export const RedSuit: Story = {
  args: {
    suit: Suit.Diamonds,
    rank: 7,
    flipped: false,
  },
}
