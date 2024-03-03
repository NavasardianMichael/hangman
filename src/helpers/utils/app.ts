import { ALPHABET } from "helpers/constants/app"

export const getSplittedWord = (word: string) => {
    const lettersArr = Array.from(word) as (typeof ALPHABET[number])[];

    return lettersArr.reduce((acc, letter) => {
        acc.push(letter)
        return acc
    }, [] as (typeof ALPHABET[number])[])
}