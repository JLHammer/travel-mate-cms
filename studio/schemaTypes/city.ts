import {defineField, defineType} from 'sanity'

export const city = defineType({
  name: 'city',
  title: 'City',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
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

    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{type: 'country'}],
    }),
  ],
})
