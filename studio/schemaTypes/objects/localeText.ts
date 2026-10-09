import {defineField, defineType} from 'sanity'
import {LANGUAGES} from '../languages'

// Like localeString, but a multi-line textarea for longer text
export const localeText = defineType({
  name: 'localeText',
  title: 'Localized text',
  type: 'object',
  fields: LANGUAGES.map(({id, title}) => defineField({name: id, title, type: 'text', rows: 5})),
})
