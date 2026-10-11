import {defineField} from 'sanity'

// Pages a menu item or button can link to. Editors pick a page instead of typing a URL so links can't break
// The frontend builds the URL in the reader's language, like /lande or /countries
export const SITE_PAGES = [
  {title: 'Home', value: 'home'},
  {title: 'Countries', value: 'countries'},
  {title: 'Cities', value: 'cities'},
  {title: 'Attractions', value: 'attractions'},
  {title: 'About', value: 'about'},
  {title: 'Contact', value: 'contact'},
  {title: 'Privacy policy', value: 'privacy'},
  {title: 'Terms of use', value: 'terms'},
  {title: 'Favourites', value: 'favorites'},
]

// Like pageTitle('privacy') → 'Privacy policy'
export const pageTitle = (page: string | undefined) =>
  SITE_PAGES.find(({value}) => value === page)?.title ?? 'No page chosen'

export const pageField = () =>
  defineField({
    name: 'page',
    title: 'Page',
    type: 'string',
    options: {list: SITE_PAGES},
    validation: (rule) => rule.required(),
  })
