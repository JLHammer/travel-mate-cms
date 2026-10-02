import {defineField, defineType} from 'sanity'
import {
  descriptionField,
  featuredField,
  imageField,
  locationField,
  nameField,
  slugField,
  taglineField,
  websiteField,
} from './fields'

export const city = defineType({
  name: 'city',
  title: 'City',
  type: 'document',

  fields: [
    nameField(),
    slugField(),

    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{type: 'country'}],
      validation: (rule) => rule.required(),
    }),

    taglineField(),
    descriptionField(),
    imageField(),
    locationField(),
    websiteField(),
    featuredField(),
  ],

  preview: {
    select: {title: 'name.da', subtitle: 'country.name.da', media: 'image'},
  },
})
