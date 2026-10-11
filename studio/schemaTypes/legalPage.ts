import {defineArrayMember, defineField, defineType} from 'sanity'
import {requiredInEveryLanguage} from './fields'
import {inLanguage, PREVIEW_LANGUAGE} from './languages'

// One numbered section. The website lists the titles in the overview next to the text
const legalSection = defineArrayMember({
  name: 'legalSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'internationalizedArrayString',
      validation: requiredInEveryLanguage,
    }),
    defineField({
      name: 'body',
      title: 'Text',
      type: 'internationalizedArrayRichText',
      validation: requiredInEveryLanguage,
    }),
  ],
  preview: {
    select: {title: 'title'},
    prepare: ({title}) => ({title: inLanguage(title, PREVIEW_LANGUAGE) ?? 'Untitled section'}),
  },
})

// Used by both the privacy policy and the terms of use, which are the same kind of page
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
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
      type: 'internationalizedArrayText',
      description: 'The short text under the title',
      validation: requiredInEveryLanguage,
    }),

    defineField({
      name: 'lastUpdated',
      title: 'Last updated',
      type: 'date',
      description: 'Shown at the top of the page. Change it whenever the content changes',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: [legalSection],
      description: 'Drag the sections to change their order and numbering',
      validation: (rule) => rule.required().min(1),
    }),
  ],

  preview: {
    select: {title: 'title', lastUpdated: 'lastUpdated'},
    prepare: ({title, lastUpdated}) => ({
      title: inLanguage(title, PREVIEW_LANGUAGE) ?? 'Legal page',
      subtitle: lastUpdated ? `Last updated ${lastUpdated}` : undefined,
    }),
  },
})
