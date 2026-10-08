import type {CustomValidator} from 'sanity'

export const LANGUAGES = [
  {id: 'da', title: 'Dansk'},
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Español'},
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']

type LocaleValue = Partial<Record<LanguageId, string>> | undefined

export const requireLanguages: CustomValidator<LocaleValue> = (value) => {
  const missing = LANGUAGES.filter(({id}) => !value?.[id]?.trim())

  return missing.length === 0 ? true : `Required in: ${missing.map(({title}) => title).join(', ')}`
}

export const maxLengthPerLanguage =
  (max: number): CustomValidator<LocaleValue> =>
  (value) => {
    const tooLong = LANGUAGES.filter(({id}) => (value?.[id]?.length ?? 0) > max)

    return tooLong.length === 0
      ? true
      : `Max ${max} characters in: ${tooLong.map(({title}) => title).join(', ')}`
  }
