import { TSettings } from 'store/types'

export type GetWordAPI = {
  payload: Pick<TSettings, 'minLettersCount' | 'category' | 'difficulty'> & {
    passedWords: string[]
  }
  response: {
    word: string
    hint: string
  }
}

export type TWordResult = GetWordAPI['response'] & {
  source: 'ai' | 'offline'
}
