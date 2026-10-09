import {at, defineMigration, set} from 'sanity/migrate'
import {LANGUAGES} from '../../schemaTypes/languages'
import {slugify} from '../../schemaTypes/slugify'

type LocaleValue = Record<string, string | undefined> | undefined

// Turns slug from one plain slug into a localeSlug.
// The old slug is kept as the English one, so existing links still work, and the others are made from the name
export default defineMigration({
  title: 'Localize slugs',
  documentTypes: ['country', 'city', 'attraction'],
  filter: 'defined(slug.current)',

  migrate: {
    document(doc) {
      const oldSlug = (doc.slug as {current?: unknown} | undefined)?.current
      if (typeof oldSlug !== 'string') return

      const name = doc.name as LocaleValue
      const slugs = Object.fromEntries(
        LANGUAGES.map(({id}) => {
          const current = id === 'en' || !name?.[id] ? oldSlug : slugify(name[id])
          return [id, {_type: 'slug', current}]
        }),
      )

      return at('slug', set({_type: 'localeSlug', ...slugs}))
    },
  },
})
