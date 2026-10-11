import {at, defineMigration, unset} from 'sanity/migrate'

// The featured checkbox was replaced by the hand-ordered carousels on the home page.
// Run it after seed-home-page.ts, which reads the ticked boxes to fill the carousels
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
