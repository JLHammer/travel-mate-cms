import {randomUUID} from 'node:crypto'
import {at, defineMigration, set, unset} from 'sanity/migrate'

// Each localized field and the plugin type for its array items
const FIELDS = [
  {path: 'name', itemType: 'internationalizedArrayStringValue'},
  {path: 'tagline', itemType: 'internationalizedArrayStringValue'},
  {path: 'description', itemType: 'internationalizedArrayTextValue'},
  {path: 'slug', itemType: 'internationalizedArraySlugValue'},
  {path: 'image.alt', itemType: 'internationalizedArrayStringValue'},
]

type LocaleObject = Record<string, unknown>

const get = (doc: Record<string, unknown>, path: string) =>
  path.split('.').reduce<unknown>((value, key) => (value as LocaleObject | undefined)?.[key], doc)

const isLocaleObject = (value: unknown): value is LocaleObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Skip empty strings and slugs without a value, so they don't become empty translations
const hasContent = (value: unknown) =>
  typeof value === 'string' ? value.trim() !== '' : Boolean((value as {current?: string})?.current)

// Turns {da: 'Italien', en: 'Italy'} into [{language: 'da', value: 'Italien'}, …], sorted like the Studio does
// Fields that are already arrays are skipped, so running it again changes nothing
const toArray = (value: LocaleObject, itemType: string) =>
  Object.keys(value)
    .filter((key) => !key.startsWith('_') && hasContent(value[key]))
    .sort()
    .map((language) => ({
      _key: randomUUID().replaceAll('-', '').slice(0, 12),
      _type: itemType,
      language,
      value: value[language],
    }))

// Turns name, tagline, description, slug and image.alt from an object with a field per language
// into an internationalized array with one item per language
export default defineMigration({
  title: 'Localize fields as internationalized arrays',
  documentTypes: ['country', 'city', 'attraction'],

  migrate: {
    document(doc) {
      return FIELDS.flatMap(({path, itemType}) => {
        const value = get(doc, path)
        if (!isLocaleObject(value)) return []

        const items = toArray(value, itemType)
        return [at(path, items.length > 0 ? set(items) : unset())]
      })
    },
  },
})
