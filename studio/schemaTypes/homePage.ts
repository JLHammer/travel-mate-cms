import {defineArrayMember, defineField, defineType, type ArrayRule} from 'sanity'
import {requiredInEveryLanguage} from './fields'
import {maxLengthPerLanguage} from './languages'

type Reference = {_key: string; _ref?: string}

// The same place twice in one carousel is almost always a mistake, so mark every copy after the first
const noDuplicates = (rule: ArrayRule<Reference[]>) =>
  rule.custom((items) => {
    const duplicates = (items ?? []).filter(
      (item, index, all) => item._ref && all.findIndex(({_ref}) => _ref === item._ref) < index,
    )
    return duplicates.length === 0
      ? true
      : duplicates.map(({_key}) => ({message: 'Already in this list', path: [{_key}]}))
  })

// A carousel on the front page: a heading and the places in it, in the order they're shown
const featuredSection = (name: string, title: string, type: string) =>
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
        name: 'items',
        title: 'Shown in this order',
        type: 'array',
        of: [defineArrayMember({type: 'reference', to: [{type}]})],
        description: 'Drag to change the order. Leave it empty to hide the carousel',
        validation: (rule) => [rule.max(12), noDuplicates(rule)],
      }),
    ],
  })

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',

  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      description: 'The big image at the top, with the search bar',
      options: {collapsible: true},
      fields: [
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
          description: 'Each line is shown on its own line',
          validation: requiredInEveryLanguage,
        }),
        defineField({
          name: 'tagline',
          title: 'Handwritten tagline',
          type: 'internationalizedArrayText',
          description: 'Optional. The tilted text on the image. Keep it to two short lines',
          validation: (rule) => rule.custom(maxLengthPerLanguage(40)),
        }),
        // Only decoration behind the title, so unlike other images it has no alternative text
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          description:
            'A wide landscape photo. Set the hotspot on what must stay visible on phones',
          options: {hotspot: true},
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    featuredSection('countries', 'Countries carousel', 'country'),
    featuredSection('cities', 'Cities carousel', 'city'),
    featuredSection('attractions', 'Attractions carousel', 'attraction'),
  ],

  preview: {
    prepare: () => ({title: 'Home page'}),
  },
})
