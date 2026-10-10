import {defineField, defineType} from 'sanity'
import {
  descriptionField,
  featuredField,
  imageField,
  nameField,
  slugField,
  taglineField,
} from './fields'

export const country = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',

  fields: [
    nameField(),
    slugField(),

    defineField({
      name: 'code',
      title: 'Country code',
      type: 'string',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[A-Z]{2}$/, {name: 'two capital letters'})
          .error('Use the two-letter ISO code in capitals, e.g. IT'),
    }),

    taglineField(),
    descriptionField(),
    imageField(),
    featuredField(),
  ],

  preview: {
    select: {title: 'name.en', subtitle: 'code', media: 'image'},
  },
})
