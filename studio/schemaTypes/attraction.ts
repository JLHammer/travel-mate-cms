import {defineField, defineType} from 'sanity'

export const attraction = defineType({
  name: 'attraction',
  title: 'Attraction',
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
      name: 'address',
      type: 'string',
    }),

    defineField({
      name: 'latitude',
      type: 'number',
    }),

    defineField({
      name: 'longitude',
      type: 'number',
    }),

    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
    }),
  ],
})
