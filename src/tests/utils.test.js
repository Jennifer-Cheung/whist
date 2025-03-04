import { test, expect } from "vitest"
import { rankBiggerThan, isNumber } from "../utils"

const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
const pairs = []
for (let i = 0; i < ranks.length; i++) {
  for (let j = i + 1; j < ranks.length; j++) {
    pairs.push([ranks[i], ranks[j], false])
  }
}

console.log(rankBiggerThan("10", "3"))

test.each(pairs)("Comparing %s and %s", ([i, j, expected]) => {
  expect(rankBiggerThan(i, j)).toBe(false)
})

test.each(ranks)("Checking %s", ([s]) => {
  expect(isNumber(s)).toBe(["J", "Q", "K", "A"].indexOf(s) === -1)
})
