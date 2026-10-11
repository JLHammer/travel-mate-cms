import type {CurrentUser, CustomValidator, SanityClient} from 'sanity'

export const API_VERSION = '2025-02-19'

// A language from a locale document, e.g. {id: 'da', title: 'Dansk', enabled: true}
export type Locale = {id: string; title: string; enabled: boolean}

// Shape of a localized field's value, e.g. [{_key: 'x1', language: 'da', value: 'Italien'}, …]
type LocalizedValue = {_key: string; language?: string; value?: unknown}[] | undefined

// Only published locales count, so a language being set up as a draft doesn't appear yet
const LOCALES_QUERY = `*[_type == "locale" && defined(code)] | order(code asc) { "id": code, title, "enabled": enabled == true }`

// Validation runs on every edit, so the locales are fetched at most every 30 seconds
const CACHE_MS = 30_000
let cache: {fetchedAt: number; locales: Promise<Locale[]>} | undefined

// Every language, enabled or not, so editors can prepare a language before it's switched on
export const fetchLocales = (client: SanityClient) => {
  if (!cache || Date.now() - cache.fetchedAt > CACHE_MS) {
    const locales = client
      .withConfig({apiVersion: API_VERSION, perspective: 'published'})
      .fetch<Locale[]>(LOCALES_QUERY)
    cache = {fetchedAt: Date.now(), locales}
  }
  return cache.locales
}

export const isAdministrator = (user: Omit<CurrentUser, 'role'> | null | undefined) =>
  Boolean(user?.roles.some(({name}) => name === 'administrator'))

// Lists in the Studio show each document's English name
export const PREVIEW_LANGUAGE = 'en'

// The value in one language, e.g. inLanguage(name, 'en') → 'Italy'. A slug's value is read from .current
export const inLanguage = (value: unknown, language: string) => {
  const item = (value as LocalizedValue)?.find((entry) => entry.language === language)
  const text = item?.value as string | {current?: string} | undefined
  return typeof text === 'string' ? text : text?.current
}

type Block = {children?: {text?: string}[]}

// Rich text is a list of blocks, so it only counts as written if a block has some actual text.
// An empty editor still leaves one empty paragraph behind
const isFilledIn = (value: unknown, language: string) => {
  const text = (value as LocalizedValue)?.find((entry) => entry.language === language)?.value
  if (Array.isArray(text)) {
    return (text as Block[]).some((block) => block.children?.some((child) => child.text?.trim()))
  }
  return Boolean(inLanguage(value, language)?.trim())
}

// Check that the enabled (or the not yet enabled) languages all have a value, and name the missing ones if not
export const requireLanguages =
  (which: 'enabled' | 'disabled' | 'all'): CustomValidator<LocalizedValue> =>
  async (value, {getClient}) => {
    const locales = await fetchLocales(getClient({apiVersion: API_VERSION}))
    const missing = locales
      .filter(({enabled}) => which === 'all' || enabled === (which === 'enabled'))
      .filter(({id}) => !isFilledIn(value, id))

    return missing.length === 0 ? true : `Missing in: ${missing.map(({title}) => title).join(', ')}`
  }

// Check that no language is longer than max, and mark the too-long ones if not
export const maxLengthPerLanguage =
  (max: number): CustomValidator<LocalizedValue> =>
  (value) => {
    const tooLong = (value ?? []).filter(
      (item) => typeof item.value === 'string' && item.value.length > max,
    )

    return tooLong.length === 0
      ? true
      : tooLong.map(({_key, language}) => ({
          message: `Max ${max} characters (${language?.toUpperCase()})`,
          path: [{_key}, 'value'],
        }))
  }
