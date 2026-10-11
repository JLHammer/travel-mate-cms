import {getCliClient} from 'sanity/cli'
import {API_VERSION} from '../schemaTypes/languages'

// The menus as they were hardcoded in the frontend, so the website looks the same after the switch
const HEADER = ['home', 'countries', 'cities', 'attractions', 'about', 'favorites']
const FOOTER = ['about', 'contact', 'privacy', 'terms']

const links = (pages: string[]) => pages.map((page) => ({_key: page, _type: 'navLink', page}))

// Creates the navigation document if it doesn't exist yet, so running it again never overwrites the editors' changes.
// Run once with: npx sanity exec scripts/seed-navigation.ts --with-user-token
// Add "-- --dry-run" to only print the document
const seed = async () => {
  const navigation = {
    _id: 'navigation',
    _type: 'navigation',
    headerLinks: links(HEADER),
    footerLinks: links(FOOTER),
  }

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(navigation, null, 2))
    return
  }

  await getCliClient({apiVersion: API_VERSION}).createIfNotExists(navigation)
  console.log('navigation: created, or already existed')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
