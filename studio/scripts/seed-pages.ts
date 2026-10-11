import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'
import {API_VERSION} from '../schemaTypes/languages'
import pages from './data/pages.json'

// The texts as they were hardcoded in the frontend (src/i18n/legal.ts and the about texts in
// translations.ts), copied into data/pages.json so the pages look the same after the switch

type Language = keyof typeof pages.about
type LegalSection = {title: string; paragraphs: string[]; list?: string[]}

const LANGUAGES = Object.keys(pages.about) as Language[]

const key = () => randomUUID().replaceAll('-', '').slice(0, 12)

// One item per language, in the shape the plugin stores, e.g. [{language: 'da', value: 'Om os'}, …]
const localized = <T>(itemType: string, pick: (language: Language) => T) =>
  LANGUAGES.map((language) => ({_key: key(), _type: itemType, language, value: pick(language)}))

const string = (pick: (language: Language) => string) =>
  localized('internationalizedArrayStringValue', pick)
const text = (pick: (language: Language) => string) =>
  localized('internationalizedArrayTextValue', pick)
const richText = (pick: (language: Language) => ReturnType<typeof block>[]) =>
  localized('internationalizedArrayRichTextValue', pick)

// A Portable Text paragraph, or a bullet point if listItem is set
const block = (content: string, listItem?: 'bullet') => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{_key: key(), _type: 'span', text: content, marks: []}],
  ...(listItem && {listItem, level: 1}),
})

const sectionBlocks = ({paragraphs, list = []}: LegalSection) => [
  ...paragraphs.map((paragraph) => block(paragraph)),
  ...list.map((item) => block(item, 'bullet')),
]

// The sections line up across languages, so section number i is the same section in every language
const legalPage = (id: string, content: typeof pages.privacy) => ({
  _id: id,
  _type: 'legalPage',
  title: string((language) => content[language].title),
  intro: text((language) => content[language].intro),
  lastUpdated: pages.lastUpdated,
  sections: content.en.sections.map((_, index) => ({
    _key: key(),
    _type: 'legalSection',
    title: string((language) => content[language].sections[index].title),
    body: richText((language) => sectionBlocks(content[language].sections[index])),
  })),
})

const about = (language: Language) => pages.about[language]

type ExploreKey = keyof typeof pages.about.en.explore
type FeatureKey = keyof typeof pages.about.en.features

const exploreCard = (page: ExploreKey, icon: string) => ({
  _key: key(),
  _type: 'aboutCard',
  icon,
  title: string((language) => about(language).explore[page].title),
  text: text((language) => about(language).explore[page].text),
  linkPage: page,
  linkLabel: string((language) => about(language).explore[page].link),
})

const featureCard = (feature: FeatureKey, icon: string) => ({
  _key: key(),
  _type: 'aboutCard',
  icon,
  title: string((language) => about(language).features[feature].title),
  text: text((language) => about(language).features[feature].text),
})

const aboutPage = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  title: string((language) => about(language).title),
  intro: richText((language) => [block(about(language).intro1), block(about(language).intro2)]),
  explore: {
    title: string((language) => about(language).exploreTitle),
    cards: [
      exploreCard('countries', 'globe'),
      exploreCard('cities', 'building'),
      exploreCard('attractions', 'landmark'),
    ],
  },
  features: {
    title: string((language) => about(language).featuresTitle),
    cards: [
      featureCard('map', 'mapPin'),
      featureCard('favourites', 'heart'),
      featureCard('screens', 'moon'),
    ],
  },
  outro: {
    title: string((language) => about(language).upToDateTitle),
    text: text((language) => about(language).upToDateText),
    linkPage: 'contact',
    linkLabel: string((language) => about(language).getInTouch),
  },
}

// Creates the pages that don't exist yet, so running it again never overwrites the editors' changes.
// Run once with: npx sanity exec scripts/seed-pages.ts --with-user-token
// Add "-- --dry-run" to only print the documents
const seed = async () => {
  const documents: {_id: string; _type: string}[] = [
    aboutPage,
    legalPage('privacyPage', pages.privacy),
    legalPage('termsPage', pages.terms),
  ]

  if (process.argv.includes('--dry-run')) {
    console.log(JSON.stringify(documents, null, 2))
    return
  }

  const client = getCliClient({apiVersion: API_VERSION})
  // In one transaction, so the pages are either all created or none of them are
  const transaction = client.transaction()
  documents.forEach((doc) => transaction.createIfNotExists(doc))
  await transaction.commit()
  console.log(`${documents.map(({_id}) => _id).join(', ')}: created, or already existed`)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
