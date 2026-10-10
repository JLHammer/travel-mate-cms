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
import {inLanguage, PREVIEW_LANGUAGE} from './languages'

export const attraction = defineType({
  name: 'attraction',
  title: 'Attraction',
  type: 'document',

  fields: [
    nameField(),
    slugField(),

    defineField({
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Historical', value: 'historical'},
          {title: 'Museum', value: 'museum'},
          {title: 'Park', value: 'park'},
          {title: 'Attraction', value: 'attraction'},
          {title: 'Landmark', value: 'landmark'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),

    taglineField(),
    descriptionField(),
    imageField(),

    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      // Parks and landmarks may have no street address, so a location is enough to find them
      validation: (rule) =>
        rule.custom((address, {document}) =>
          address?.trim() || document?.location ? true : 'Add an address or a location',
        ),
    }),

    locationField(),
    websiteField(),
    featuredField(),
  ],

  preview: {
    select: {name: 'name', parent: 'city.name', media: 'image'},
    prepare: ({name, parent, media}) => ({
      title: inLanguage(name, PREVIEW_LANGUAGE),
      subtitle: inLanguage(parent, PREVIEW_LANGUAGE),
      media,
    }),
  },
})
