import {at, defineMigration, set} from 'sanity/migrate'
import {LANGUAGES} from '../../schemaTypes/languages'

type LocaleValue = Record<string, string | undefined> | undefined

// Turns image.alt from a plain string into a localeString.
// The old alt text was always the English name, so each language gets the document's own name
export default defineMigration({
  title: 'Localize image alt text',
  documentTypes: ['country', 'city', 'attraction'],
  filter: 'defined(image.alt) && !defined(image.alt.en)',

  migrate: {
    document(doc) {
      const image = doc.image as {alt?: unknown} | undefined
      if (typeof image?.alt !== 'string') return

      const oldAlt = image.alt
      const name = doc.name as LocaleValue
      const alt = Object.fromEntries(LANGUAGES.map(({id}) => [id, name?.[id] ?? oldAlt]))

      return at('image.alt', set({_type: 'localeString', ...alt}))
    },
  },
})
