import {defineField, defineType} from 'sanity'
import {LANGUAGES} from '../languages'

// Short text in every language, e.g. name.da / name.en
// Turns each id in LANGUAGES into a field of type string, e.g. {name: 'da', title: 'Danish', type: 'string'}
export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fields: LANGUAGES.map(({id, title}) => defineField({name: id, title, type: 'string'})),
})
