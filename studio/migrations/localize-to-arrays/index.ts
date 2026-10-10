import {randomUUID} from 'node:crypto'
import {at, defineMigration, set, unset} from 'sanity/migrate'

// Each localized field and the plugin type its array items get
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

// Empty strings and slugs without a value are left out, so they don't become empty translations
const hasContent = (value: unknown) =>
  typeof value === 'string' ? value.trim() !== '' : Boolean((value as {current?: string})?.current)

// Turns {da: 'Italien', en: 'Italy'} into [{language: 'da', value: 'Italien'}, …], sorted by language
// like the Studio sorts them. A field that's already an array is left alone, so running it again changes nothing
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

// Turns name, tagline, description, slug and image.alt from one object with a field per language
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
