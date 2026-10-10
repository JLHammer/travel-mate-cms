import {at, defineMigration, set, type NodePatch} from 'sanity/migrate'
import {slugify} from '../../schemaTypes/slugify'

type Item = {_key: string; language?: string; value?: unknown}

// One correction in one language of one field. A text that no longer contains `from` is left alone,
// so running the migration again changes nothing
type Fix = {
  id: string
  field: 'name' | 'tagline' | 'description'
  language: string
  from: string
  to: string
}

const FIXES: Fix[] = [
  // Danish
  {
    id: 'attraction-hohensalzburg-fortress',
    field: 'description',
    language: 'da',
    from: 'fyrstærkebiskopper',
    to: 'fyrsteærkebiskopper',
  },
  {
    id: 'attraction-liseberg',
    field: 'description',
    language: 'da',
    from: 'Træ-rutsjebanen',
    to: 'Trærutsjebanen',
  },
  {
    id: 'attraction-liseberg',
    field: 'description',
    language: 'da',
    from: 'træ-rutsjebane',
    to: 'trærutsjebane',
  },
  {
    id: 'attraction-rijksmuseum',
    field: 'description',
    language: 'da',
    from: 'Museumpladsen',
    to: 'Museumspladsen',
  },

  // Spanish
  {
    id: 'city-reykjavik',
    field: 'description',
    language: 'es',
    from: 'la capital de un Estado soberano más septentrional',
    to: 'la capital de Estado soberano más septentrional',
  },
  {
    id: 'city-sirmione',
    field: 'description',
    language: 'es',
    from: 'el castillo Scaligero',
    to: 'el castillo Escalígero',
  },
  {
    id: 'attraction-gullfoss',
    field: 'description',
    language: 'es',
    from: 'profundo cañón creando',
    to: 'profundo cañón, creando',
  },
  {
    id: 'country-belgium',
    field: 'description',
    language: 'es',
    from: 'en la región costera de tierras bajas del noroeste del continente',
    to: 'situado en una región costera de tierras bajas',
  },
  {
    id: 'city-san-marino',
    field: 'description',
    language: 'es',
    from: 'del Monte Titano',
    to: 'del monte Titano',
  },
  {
    id: 'country-san-marino',
    field: 'description',
    language: 'es',
    from: 'el Monte Titano',
    to: 'el monte Titano',
  },
  {
    id: 'attraction-monte-titano',
    field: 'description',
    language: 'es',
    from: 'El Monte Titano',
    to: 'El monte Titano',
  },
  {
    id: 'city-dublin',
    field: 'description',
    language: 'es',
    from: 'el Castillo de Dublín',
    to: 'el castillo de Dublín',
  },

  // English
  {
    id: 'country-spain',
    field: 'description',
    language: 'en',
    from: 'specialties',
    to: 'specialities',
  },
  {
    id: 'attraction-abbey-of-echternach',
    field: 'tagline',
    language: 'en',
    from: 'St Willibrord',
    to: 'St. Willibrord',
  },
  {
    id: 'attraction-abbey-of-echternach',
    field: 'description',
    language: 'en',
    from: 'St Willibrord',
    to: 'St. Willibrord',
  },
  {
    id: 'attraction-basilica-of-st-willibrord',
    field: 'description',
    language: 'en',
    from: 'St Willibrord',
    to: 'St. Willibrord',
  },
  {
    id: 'attraction-geysir',
    field: 'description',
    language: 'en',
    from: 'south-western',
    to: 'southwestern',
  },
  {
    id: 'attraction-englischer-garten',
    field: 'description',
    language: 'en',
    from: 'north-eastern',
    to: 'northeastern',
  },
]

// English slugs kept from before the slugs were localized, which no longer match the English name
const STALE_ENGLISH_SLUGS = [
  'attraction-fl-yen',
  'attraction-catedral-de-canarias',
  'attraction-mont-saint-michel',
  'city-luxembourg-city',
]

// The text fields that get curly apostrophes, e.g. Italy's → Italy’s, like the rest of the content
const TEXT_FIELDS = ['name', 'tagline', 'description']

const itemIn = (value: unknown, language: string) =>
  (value as Item[] | undefined)?.find((item) => item.language === language)

// Fixes the spelling mistakes found in a spellcheck of all content, writes every apostrophe
// as a curly one and remakes the stale English slugs from the English name
export default defineMigration({
  title: 'Fix spelling, apostrophes and stale English slugs',
  documentTypes: ['country', 'city', 'attraction'],

  migrate: {
    document(doc) {
      const patches: NodePatch[] = []

      // Collect each field's new text first, so several fixes to the same text become one patch
      const texts = new Map<string, {field: string; item: Item; text: string}>()
      const textOf = (field: string, item: Item) => {
        const id = `${field}.${item._key}`
        if (!texts.has(id)) texts.set(id, {field, item, text: item.value as string})
        return texts.get(id)!
      }

      for (const {field, language, from, to} of FIXES.filter(({id}) => id === doc._id)) {
        const item = itemIn(doc[field], language)
        if (item && typeof item.value === 'string') {
          const entry = textOf(field, item)
          entry.text = entry.text.replaceAll(from, to)
        }
      }

      for (const field of TEXT_FIELDS) {
        for (const item of (doc[field] as Item[] | undefined) ?? []) {
          if (typeof item.value === 'string' && item.value.includes("'")) {
            const entry = textOf(field, item)
            entry.text = entry.text.replaceAll("'", '’')
          }
        }
      }

      for (const {field, item, text} of texts.values()) {
        if (text !== item.value) patches.push(at([field, {_key: item._key}, 'value'], set(text)))
      }

      if (STALE_ENGLISH_SLUGS.includes(doc._id)) {
        const slug = itemIn(doc.slug, 'en')
        const name = itemIn(doc.name, 'en')?.value
        const current = typeof name === 'string' ? slugify(name) : undefined
        if (slug && current && (slug.value as {current?: string})?.current !== current) {
          patches.push(at(['slug', {_key: slug._key}, 'value', 'current'], set(current)))
        }
      }

      return patches
    },
  },
})
