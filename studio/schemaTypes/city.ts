import {defineField, defineType} from 'sanity'
import {
  descriptionField,
  imageField,
  locationField,
  nameField,
  slugField,
  taglineField,
  websiteField,
} from './fields'
import {inLanguage, PREVIEW_LANGUAGE} from './languages'

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
  ],

  preview: {
    select: {name: 'name', parent: 'country.name', media: 'image'},
    prepare: ({name, parent, media}) => ({
      title: inLanguage(name, PREVIEW_LANGUAGE),
      subtitle: inLanguage(parent, PREVIEW_LANGUAGE),
      media,
    }),
  },
})
