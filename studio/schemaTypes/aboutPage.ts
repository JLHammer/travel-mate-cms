import {defineArrayMember, defineField, defineType, type Rule, type ValidationContext} from 'sanity'
import {requiredInEveryLanguage} from './fields'
import {inLanguage, PREVIEW_LANGUAGE, requireLanguages} from './languages'
import {SITE_PAGES} from './sitePages'

// The icons the website has for the cards. Picked from a list so a card can't end up without one
const ICONS = [
  {title: 'Globe', value: 'globe'},
  {title: 'Building', value: 'building'},
  {title: 'Landmark', value: 'landmark'},
  {title: 'Map pin', value: 'mapPin'},
  {title: 'Heart', value: 'heart'},
  {title: 'Moon', value: 'moon'},
  {title: 'Languages', value: 'languages'},
  {title: 'Search', value: 'search'},
]

// The link text is only needed once the card links somewhere
const requiredWithLinkPage = (rule: Rule) =>
  rule.custom((value, context: ValidationContext) => {
    const parent = context.parent as {linkPage?: string} | undefined
    return parent?.linkPage ? requireLanguages('enabled')(value as never, context) : true
  })

const aboutCard = defineArrayMember({
  name: 'aboutCard',
  title: 'Card',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {list: ICONS, layout: 'dropdown'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: requiredInEveryLanguage,
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'internationalizedArrayText',
      validation: requiredInEveryLanguage,
    }),
    defineField({
      name: 'linkPage',
      title: 'Link to page',
      type: 'string',
      options: {list: SITE_PAGES},
      description: 'Optional. Adds a link at the bottom of the card',
    }),
    defineField({
      name: 'linkLabel',
      title: 'Link text',
      type: 'internationalizedArrayString',
      hidden: ({parent}) => !parent?.linkPage,
      validation: requiredWithLinkPage,
    }),
  ],
  preview: {
    select: {title: 'title', text: 'text'},
    prepare: ({title, text}) => ({
      title: inLanguage(title, PREVIEW_LANGUAGE) ?? 'Untitled card',
      subtitle: inLanguage(text, PREVIEW_LANGUAGE),
    }),
  },
})

// A heading with a row of cards under it
const cardSection = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    options: {collapsible: true},
    fields: [
      defineField({
        name: 'title',
        title: 'Heading',
        type: 'internationalizedArrayString',
        validation: requiredInEveryLanguage,
      }),
      defineField({
        name: 'cards',
        title: 'Cards',
        type: 'array',
        of: [aboutCard],
        description: 'Three cards fill a row on larger screens',
        validation: (rule) => rule.required().min(1),
      }),
    ],
  })

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About page',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: requiredInEveryLanguage,
    }),

    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'internationalizedArrayRichText',
      description: 'The text under the title',
      validation: requiredInEveryLanguage,
    }),

    cardSection('explore', 'Explore section'),
    cardSection('features', 'Features section'),

    // The closing text, with a link at the end, e.g. to the contact page
    defineField({
      name: 'outro',
      title: 'Closing section',
      type: 'object',
      options: {collapsible: true},
      fields: [
        defineField({
          name: 'title',
          title: 'Heading',
          type: 'internationalizedArrayString',
          validation: requiredInEveryLanguage,
        }),
        defineField({
          name: 'text',
          title: 'Text',
          type: 'internationalizedArrayText',
          validation: requiredInEveryLanguage,
        }),
        defineField({
          name: 'linkPage',
          title: 'Link to page',
          type: 'string',
          options: {list: SITE_PAGES},
          description: 'Optional. Shown right after the text',
        }),
        defineField({
          name: 'linkLabel',
          title: 'Link text',
          type: 'internationalizedArrayString',
          hidden: ({parent}) => !parent?.linkPage,
          validation: requiredWithLinkPage,
        }),
      ],
    }),
  ],

  preview: {
    prepare: () => ({title: 'About page'}),
  },
})
