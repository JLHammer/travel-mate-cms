import {createReadStream} from 'node:fs'
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {API_VERSION} from '../schemaTypes/languages'
import texts from './data/home.json'

// The hero, carousel headings and footer tagline as they were hardcoded in the frontend,
// copied into data/home.json. hero.webp is the image from the frontend's src/assets

type Language = keyof typeof texts

const LANGUAGES = Object.keys(texts) as Language[]
const DRY_RUN = process.argv.includes('--dry-run')

const key = () => randomUUID().replaceAll('-', '').slice(0, 12)

const localized = (itemType: string, pick: (language: Language) => string) =>
  LANGUAGES.map((language) => ({
    _key: key(),
    _type: itemType,
    language,
    value: pick(language),
  }))

const string = (pick: (language: Language) => string) =>
  localized('internationalizedArrayStringValue', pick)
const text = (pick: (language: Language) => string) =>
  localized('internationalizedArrayTextValue', pick)

const client = getCliClient({apiVersion: API_VERSION})

// The places that had the featured box ticked, in the same order the front page showed them
const featuredRefs = async (type: string) => {
  const ids = await client.fetch<string[]>(
    `*[_type == $type && featured == true && !(_id in path("drafts.**"))]
      | order(name[language == "en"][0].value asc)._id`,
    {type},
  )
  return ids.map((id) => ({_key: key(), _type: 'reference', _ref: id}))
}

const uploadHero = async () => {
  if (DRY_RUN) return 'image-dry-run'
  const asset = await client.assets.upload(
    'image',
    createReadStream(new URL('./data/hero.webp', import.meta.url)),
    {filename: 'hero.webp'},
  )
  return asset._id
}

// Creates the home page and the site settings if they don't exist yet, so running it again never
// overwrites the editors' changes. Run once, before the remove-featured migration, with:
// npx sanity exec scripts/seed-home-page.ts --with-user-token
// Add "-- --dry-run" to only print the documents
const seed = async () => {
  const existing = await client.fetch<string[]>(`*[_id in ["homePage", "siteSettings"]]._id`)
  const documents: {_id: string; _type: string}[] = []

  if (!existing.includes('homePage')) {
    documents.push({
      _id: 'homePage',
      _type: 'homePage',
      hero: {
        title: string((language) => texts[language].hero.title),
        text: text((language) => `${texts[language].hero.line1}\n${texts[language].hero.line2}`),
        tagline: text(
          (language) =>
            `${texts[language].hero.tagline.line1}\n${texts[language].hero.tagline.line2}`,
        ),
        // The hotspot keeps the houses on the right in view, like object-position: 85% did
        image: {
          _type: 'image',
          asset: {_type: 'reference', _ref: await uploadHero()},
          hotspot: {_type: 'sanity.imageHotspot', x: 0.85, y: 0.5, width: 0.3, height: 0.8},
        },
      },
      countries: {
        title: string((language) => texts[language].countriesTitle),
        items: await featuredRefs('country'),
      },
      cities: {
        title: string((language) => texts[language].citiesTitle),
        items: await featuredRefs('city'),
      },
      attractions: {
        title: string((language) => texts[language].attractionsTitle),
        items: await featuredRefs('attraction'),
      },
    } as {_id: string; _type: string})
  }

  if (!existing.includes('siteSettings')) {
    documents.push({
      _id: 'siteSettings',
      _type: 'siteSettings',
      footerTagline: string((language) => texts[language].footerTagline),
      socials: [
        {_key: key(), _type: 'socialLink', platform: 'instagram', url: 'https://instagram.com'},
        {_key: key(), _type: 'socialLink', platform: 'facebook', url: 'https://facebook.com'},
        {_key: key(), _type: 'socialLink', platform: 'youtube', url: 'https://youtube.com'},
      ],
    } as {_id: string; _type: string})
  }

  if (DRY_RUN) {
    console.log(JSON.stringify(documents, null, 2))
    return
  }

  const transaction = client.transaction()
  documents.forEach((doc) => transaction.createIfNotExists(doc))
  await transaction.commit()
  console.log(`created: ${documents.map(({_id}) => _id).join(', ') || 'nothing, both existed'}`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
