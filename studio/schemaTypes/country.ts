import {defineField, defineType} from 'sanity'

export const country = defineType({
  name: 'country',
  title: 'Country',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),

    defineField({
      name: 'code',
      type: 'string',
    }),

    defineField({
      name: 'slug',
      type: 'slug',
    }),

    defineField({
      name: 'description',
      type: 'text',
    }),

    defineField({
      name: 'image',
      type: 'image',
    }),
  ],
})
