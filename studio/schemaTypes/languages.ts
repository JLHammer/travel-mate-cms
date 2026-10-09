import type {CustomValidator} from 'sanity'

// Supported languages for localized fields
export const LANGUAGES = [
  {id: 'da', title: 'Dansk'},
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Español'},
]

// Shape of a localized field's value, e.g. {da: 'Italien', en: 'Italy', es: 'Italia'}
type LocaleValue = Record<string, string | undefined> | undefined

// Check that no language is empty or blank, and return a message with the missing ones if not
export const requireLanguages: CustomValidator<LocaleValue> = (value) => {
  const missing = LANGUAGES.filter(({id}) => !value?.[id]?.trim())

  return missing.length === 0 ? true : `Required in: ${missing.map(({title}) => title).join(', ')}`
}

// Check that no language is longer than max, and return a message with the too-long ones if not
export const maxLengthPerLanguage =
  (max: number): CustomValidator<LocaleValue> =>
  (value) => {
    const tooLong = LANGUAGES.filter(({id}) => (value?.[id]?.length ?? 0) > max)

    return tooLong.length === 0
      ? true
      : `Max ${max} characters in: ${tooLong.map(({title}) => title).join(', ')}`
  }
