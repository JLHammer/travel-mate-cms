import {defineArrayMember, defineField, defineType, type ArrayRule} from 'sanity'
import {inLanguage, PREVIEW_LANGUAGE} from './languages'
import {pageField, pageTitle} from './sitePages'

type NavLink = {_key: string; page?: string}

const navLink = defineArrayMember({
  name: 'navLink',
  title: 'Link',
  type: 'object',
  fields: [
    pageField(),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'internationalizedArrayString',
      description:
        'Optional. A language left empty shows the standard name of the page, e.g. "Lande" or "Countries"',
    }),
  ],
  preview: {
    select: {page: 'page', label: 'label'},
    prepare: ({page, label}) => ({
      title: inLanguage(label, PREVIEW_LANGUAGE) ?? pageTitle(page),
      subtitle: pageTitle(page),
    }),
  },
})

// A page twice in the same menu is almost always a mistake, so mark every copy after the first
const noDuplicatePages = (rule: ArrayRule<NavLink[]>) =>
  rule.custom((links) => {
    const duplicates = (links ?? []).filter(
      (link, index, all) => link.page && all.findIndex(({page}) => page === link.page) < index,
    )
    return duplicates.length === 0
      ? true
      : duplicates.map(({_key, page}) => ({
          message: `${pageTitle(page)} is already in this menu`,
          path: [{_key}],
        }))
  })

// The menus in the header and footer. Drag the links to change their order on the website
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',

  fields: [
    defineField({
      name: 'headerLinks',
      title: 'Header menu',
      type: 'array',
      of: [navLink],
      description: 'The menu at the top of every page, and in the menu button on phones',
      validation: (rule) => [rule.required().min(1), noDuplicatePages(rule)],
    }),

    defineField({
      name: 'footerLinks',
      title: 'Footer menu',
      type: 'array',
      of: [navLink],
      description: 'The links at the bottom of every page',
      validation: (rule) => [rule.required().min(1), noDuplicatePages(rule)],
    }),
  ],

  preview: {
    prepare: () => ({title: 'Navigation'}),
  },
})
