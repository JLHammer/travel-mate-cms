import {defineField, defineType, type SlugIsUniqueValidator} from 'sanity'
import {LANGUAGES} from '../languages'
import {slugify} from '../slugify'

// Every language's slug, e.g. slug.da.current / slug.en.current
const ALL_SLUGS = LANGUAGES.map(({id}) => `slug.${id}.current`).join(', ')

// A slug must be unique across all languages within its type, so a URL always points to one document.
// The same document may reuse a slug in several languages, e.g. 'atomium'
const isUniqueInAnyLanguage: SlugIsUniqueValidator = async (slug, {document, getClient}) => {
  if (!document) return true

  const id = document._id.replace(/^drafts\./, '')
  const params = {type: document._type, slug, draft: `drafts.${id}`, published: id}
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && $slug in [${ALL_SLUGS}]][0]._id)`

  return getClient({apiVersion: '2025-02-19'}).fetch(query, params)
}

// URL part in every language, each made from the name in that language
export const localeSlug = defineType({
  name: 'localeSlug',
  title: 'Localized slug',
  type: 'object',
  fields: LANGUAGES.map(({id, title}) =>
    defineField({
      name: id,
      title,
      type: 'slug',
      options: {source: `name.${id}`, maxLength: 96, slugify, isUnique: isUniqueInAnyLanguage},
      validation: (rule) => rule.required(),
    }),
  ),
})
