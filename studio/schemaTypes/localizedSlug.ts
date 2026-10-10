import {defineField, type SlugIsUniqueValidator, type SlugSourceFn} from 'sanity'
import {API_VERSION, inLanguage} from './languages'
import {slugify} from './slugify'

// A slug must be unique across all languages within its type, so a URL always points to one document.
// The same document may reuse a slug in several languages, e.g. 'atomium'
const isUniqueInAnyLanguage: SlugIsUniqueValidator = async (slug, {document, getClient}) => {
  if (!document) return true

  const id = document._id.replace(/^drafts\./, '')
  const params = {type: document._type, slug, draft: `drafts.${id}`, published: id}
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && $slug in slug[].value.current][0]._id)`

  return getClient({apiVersion: API_VERSION}).fetch(query, params)
}

// Each language's slug is made from the name in the same language
const nameInSameLanguage: SlugSourceFn = (document, {parent}) => {
  const language = (parent as {language?: string} | undefined)?.language
  return language ? (inLanguage(document.name, language) ?? '') : ''
}

// The plugin turns this into internationalizedArraySlug, one slug per language
export const localizedSlug = defineField({
  name: 'slug',
  title: 'Slug',
  type: 'slug',
  options: {source: nameInSameLanguage, maxLength: 96, slugify, isUnique: isUniqueInAnyLanguage},
})
