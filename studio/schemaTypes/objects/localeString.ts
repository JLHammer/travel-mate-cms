import {defineField, defineType} from 'sanity'
import {LANGUAGES} from '../languages'

// Short text in every language, e.g. name.da / name.en
export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fields: LANGUAGES.map(({id, title}) => defineField({name: id, title, type: 'string'})),
})
