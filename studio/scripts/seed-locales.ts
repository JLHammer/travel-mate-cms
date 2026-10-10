import {getCliClient} from 'sanity/cli'
import {API_VERSION} from '../schemaTypes/languages'

// The languages TravelMate launched with. Content is already translated into all of them, so they start enabled
const LAUNCH_LOCALES = [
  {code: 'da', title: 'Dansk'},
  {code: 'en', title: 'English'},
  {code: 'es', title: 'Español'},
]

// Creates a locale document for each launch language that doesn't have one yet, so running it again changes nothing.
// Run once with: npx sanity exec scripts/seed-locales.ts --with-user-token
const seed = async () => {
  const client = getCliClient({apiVersion: API_VERSION})
  const existing = await client.fetch<string[]>(`*[_type == "locale"].code`)

  for (const {code, title} of LAUNCH_LOCALES) {
    if (existing.includes(code)) {
      console.log(`${code}: already exists`)
      continue
    }
    await client.create({_type: 'locale', code, title, enabled: true})
    console.log(`${code}: created`)
  }
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
