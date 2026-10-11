import {at, defineMigration, unset} from 'sanity/migrate'

// The featured checkbox is replaced by the carousels on the home page
// Run it after seed-home-page.ts, since that reads the ticked boxes to fill the carousels
export default defineMigration({
  title: 'Remove the featured checkbox',
  documentTypes: ['country', 'city', 'attraction'],
  filter: 'defined(featured)',

  migrate: {
    document() {
      return at('featured', unset())
    },
  },
})
