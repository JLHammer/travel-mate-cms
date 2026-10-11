import {defineArrayMember, defineField, defineType} from 'sanity'
import {maxLengthPerLanguage} from './languages'

// The platforms the website has an icon for
const PLATFORMS = [
  {title: 'Instagram', value: 'instagram'},
  {title: 'Facebook', value: 'facebook'},
  {title: 'YouTube', value: 'youtube'},
  {title: 'TikTok', value: 'tiktok'},
  {title: 'X', value: 'x'},
  {title: 'LinkedIn', value: 'linkedin'},
  {title: 'Pinterest', value: 'pinterest'},
]

const platformTitle = (platform: string | undefined) =>
  PLATFORMS.find(({value}) => value === platform)?.title ?? 'No platform chosen'

const socialLink = defineArrayMember({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {list: PLATFORMS},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
  ],
  preview: {
    select: {platform: 'platform', url: 'url'},
    prepare: ({platform, url}) => ({title: platformTitle(platform), subtitle: url}),
  },
})

// Things shown in the footer of every page
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',

  fields: [
    defineField({
      name: 'footerTagline',
      title: 'Footer tagline',
      type: 'internationalizedArrayString',
      description: 'Optional. The short line next to the logo in the footer',
      validation: (rule) => rule.custom(maxLengthPerLanguage(60)),
    }),

    defineField({
      name: 'socials',
      title: 'Social media',
      type: 'array',
      of: [socialLink],
      description: 'The icons in the footer, in this order',
    }),
  ],

  preview: {
    prepare: () => ({title: 'Site settings'}),
  },
})
