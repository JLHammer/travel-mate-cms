import {defineField} from 'sanity'
import {maxLengthPerLanguage, requireLanguages} from './languages'

export const nameField = () =>
  defineField({
    name: 'name',
    title: 'Name',
    type: 'localeString',
    validation: (rule) => rule.custom(requireLanguages),
  })

export const slugField = () =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {source: 'name.en', maxLength: 96},
    validation: (rule) => rule.required(),
  })

export const taglineField = () =>
  defineField({
    name: 'tagline',
    title: 'Tagline',
    type: 'localeString',
    validation: (rule) => rule.custom(maxLengthPerLanguage(80)),
  })

export const descriptionField = () =>
  defineField({
    name: 'description',
    title: 'Description',
    type: 'localeText',
    validation: (rule) => rule.custom(requireLanguages),
  })

export const imageField = () =>
  defineField({
    name: 'image',
    title: 'Image',
    type: 'image',
    options: {hotspot: true},
    validation: (rule) => rule.required(),
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        type: 'string',
        description: 'Describes the image for screen readers',
        validation: (rule) => rule.required().warning(),
      }),
      defineField({
        name: 'credit',
        title: 'Credit',
        type: 'string',
        description: 'e.g. "Jane Doe · CC BY-SA 4.0 · Wikimedia Commons"',
      }),
    ],
  })

export const featuredField = () =>
  defineField({
    name: 'featured',
    title: 'Featured',
    type: 'boolean',
    initialValue: false,
  })

export const locationField = () =>
  defineField({
    name: 'location',
    title: 'Location',
    type: 'geopoint',
  })

export const websiteField = () =>
  defineField({
    name: 'website',
    title: 'Website',
    type: 'url',
    validation: (rule) => rule.uri({scheme: ['http', 'https']}),
  })
