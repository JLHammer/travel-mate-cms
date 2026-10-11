// Fields shared by country, city and attraction
import {defineField, type Rule} from 'sanity'
import {maxLengthPerLanguage, requireLanguages} from './languages'

// Missing translations block publishing in enabled languages, and only warn in languages still in progress
export const requiredInEveryLanguage = (rule: Rule) => [
  rule.custom(requireLanguages('enabled')),
  rule.custom(requireLanguages('disabled')).warning(),
]

// Required in every language, it's the title on cards and detail pages
export const nameField = () =>
  defineField({
    name: 'name',
    title: 'Name',
    type: 'internationalizedArrayString',
    validation: requiredInEveryLanguage,
  })

// URL part in every language, like /lande/italien and /countries/italy
export const slugField = () =>
  defineField({
    name: 'slug',
    title: 'Slug',
    type: 'internationalizedArraySlug',
    validation: requiredInEveryLanguage,
  })

// Optional one-liner on country cards
export const taglineField = () =>
  defineField({
    name: 'tagline',
    title: 'Tagline',
    type: 'internationalizedArrayString',
    validation: (rule) => rule.custom(maxLengthPerLanguage(80)),
  })

// Required in every language, it's the main text on detail pages
export const descriptionField = () =>
  defineField({
    name: 'description',
    title: 'Description',
    type: 'internationalizedArrayText',
    validation: requiredInEveryLanguage,
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
        type: 'internationalizedArrayString',
        description:
          'Describes the image for screen readers, in the language they read the page in',
        // Only a warning, so missing alt text doesn't block publishing
        validation: (rule) => rule.custom(requireLanguages('all')).warning(),
      }),
      defineField({
        name: 'credit',
        title: 'Credit',
        type: 'string',
        description: 'e.g. "Jane Doe · CC BY-SA 4.0 · Wikimedia Commons"',
      }),
    ],
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
    // Only web links, so the frontend never renders something like a javascript: link
    validation: (rule) => rule.uri({scheme: ['http', 'https']}),
  })
