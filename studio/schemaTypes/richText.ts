import {defineArrayMember, defineField, defineType} from 'sanity'
import {pageField} from './sitePages'

// Text with paragraphs, bullet lists, bold, italics and links
// Only what the pages can show, so no headings or colours that would break the design
// The plugin turns it into internationalizedArrayRichText, one text per language
export const richText = defineType({
  name: 'richText',
  title: 'Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Paragraph', value: 'normal'}],
      lists: [{title: 'Bullet list', value: 'bullet'}],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          // A page on the site, so the link follows the reader's language
          defineArrayMember({
            name: 'pageLink',
            title: 'Link to page',
            type: 'object',
            fields: [pageField()],
          }),
          defineArrayMember({
            name: 'link',
            title: 'Link to website',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                // Same as websiteField, so the frontend never renders something like a javascript: link
                validation: (rule) => rule.required().uri({scheme: ['http', 'https', 'mailto']}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
