import type {CustomValidator} from 'sanity'

export const LANGUAGES = [
  {id: 'da', title: 'Dansk'},
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Español'},
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']

const REQUIRED_LANGUAGES: LanguageId[] = ['da', 'en']

type LocaleValue = Partial<Record<LanguageId, string>> | undefined

const titleOf = (id: LanguageId) => LANGUAGES.find((lang) => lang.id === id)?.title ?? id

export const requireLanguages: CustomValidator<LocaleValue> = (value) => {
  const missing = REQUIRED_LANGUAGES.filter((id) => !value?.[id]?.trim())

  return missing.length === 0 ? true : `Required in: ${missing.map(titleOf).join(', ')}`
}

export const maxLengthPerLanguage =
  (max: number): CustomValidator<LocaleValue> =>
  (value) => {
    const tooLong = LANGUAGES.filter(({id}) => (value?.[id]?.length ?? 0) > max)

    return tooLong.length === 0
      ? true
      : `Max ${max} characters in: ${tooLong.map(({id}) => titleOf(id)).join(', ')}`
  }
