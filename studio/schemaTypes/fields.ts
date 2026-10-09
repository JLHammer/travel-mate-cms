// Fields shared by country, city and attraction
import {defineField} from 'sanity'
import {maxLengthPerLanguage, requireLanguages} from './languages'

// Required in every language, since it's the title on cards and detail pages
export const nameField = () =>
  defineField({
    name: 'name',
    title: 'Name',
    type: 'localeString',
    validation: (rule) => rule.custom(requireLanguages),
  })

// URL part (e.g. /countries/italy), made from the English name so it's the same in every language
export const slugField = () =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'slug',
    options: {source: 'name.en', maxLength: 96},
    validation: (rule) => rule.required(),
  })

// Optional one-liner on country cards
export const taglineField = () =>
  defineField({
    name: 'tagline',
    title: 'Tagline',
    type: 'localeString',
    validation: (rule) => rule.custom(maxLengthPerLanguage(80)),
  })

// Required in every language, since it's the main text on detail pages
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
        // Only a warning, so missing alt text doesn't block publishing
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

// Ticked items are shown in the featured sections on the front page
export const featuredField = () =>
  defineField({
    name: 'featured',
    title: 'Featured',
    type: 'boolean',
    initialValue: false,
  })

// Latitude/longitude, shown on city and attraction detail pages
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
    // Only web links, so the frontend never renders e.g. a javascript: link
    validation: (rule) => rule.uri({scheme: ['http', 'https']}),
  })
