# TravelMate Studio

The Sanity Studio for TravelMate. Editors write countries, cities, attractions and the site's own pages here in Danish, English and Spanish, and the [TravelMate frontend](../../travel-mate-frontend) reads them with GROQ.

- Project: `cc196r01`
- Dataset: `production`

## Getting started

```bash
npm install
npm run dev
```

The Studio opens at <http://localhost:3333>.

| Script | What it does |
|---|---|
| `npm run dev` | Starts the Studio locally |
| `npm run build` | Builds the Studio |
| `npm run deploy` | Deploys the Studio to Sanity's hosting |
| `npm run typegen` | Writes the query result types and the enabled languages to the frontend (see [Generated types](#generated-types)) |

## Content model

```text
Country
  └── City        (city.country → reference to Country)
       └── Attraction  (attraction.city → reference to City)
```

| Type | File | Fields |
|---|---|---|
| `country` | `schemaTypes/country.ts` | name, slug, code, tagline, description, image |
| `city` | `schemaTypes/city.ts` | name, slug, country, tagline, description, image, location, website |
| `attraction` | `schemaTypes/attraction.ts` | name, slug, city, category, tagline, description, image, address, location, website |
| `locale` | `schemaTypes/locale.ts` | title, code, enabled |

Fields used by more than one type are defined once in `schemaTypes/fields.ts`.

### Pages and settings

Everything on the website that isn't a country, city or attraction is a singleton: a document there's only one of. They're listed in `singletons.ts` and shown under the content types in the sidebar. Each one opens its document straight away, and it can't be created, duplicated, deleted or unpublished, so the website never loses a page.

| Singleton | Type | File | What editors control |
|---|---|---|---|
| Home page | `homePage` | `schemaTypes/homePage.ts` | The hero (title, text, tagline, background image) and the three carousels: a heading and the countries, cities and attractions in it, dragged into order |
| About page | `aboutPage` | `schemaTypes/aboutPage.ts` | Title, intro, two groups of cards (icon, title, text, link) and the closing text with a link |
| Privacy policy | `legalPage` | `schemaTypes/legalPage.ts` | Title, intro, last updated date and the numbered sections |
| Terms of use | `legalPage` | `schemaTypes/legalPage.ts` | Same fields as the privacy policy |
| Navigation | `navigation` | `schemaTypes/navigation.ts` | The header and footer menus. Each link picks a page and can have its own label |
| Site settings | `siteSettings` | `schemaTypes/siteSettings.ts` | The footer tagline and the social media links |

Links to the website's own pages never use a typed URL. Editors pick a page from the list in `schemaTypes/sitePages.ts`, and the frontend builds the URL in the reader's language, so a link can't break when a slug changes. Body text on the about and legal pages is rich text (`schemaTypes/richText.ts`): paragraphs, bullet lists, bold, italics and links, and nothing that could break the design.

All text in the singletons is translated the same way as the rest of the content, see [Languages](#languages).

## Languages

Each language is a `locale` document, listed under **Languages** for administrators only. It has a name, a two-letter code and an **Enabled** switch. A language can't be deleted, unpublished or duplicated, and its code can't change once it's published, because every translation is stored under that code.

Translated fields use [`sanity-plugin-internationalized-array`](https://github.com/sanity-io/plugins/tree/main/plugins/sanity-plugin-internationalized-array), set up in `sanity.config.ts`. It reads the languages from the `locale` documents and adds three field types, each holding one item per language:

| Type | Used for |
|---|---|
| `internationalizedArrayString` | Short text: `name`, `tagline`, `image.alt` |
| `internationalizedArrayText` | Longer text: `description` |
| `internationalizedArraySlug` | The URL part: `slug` (defined in `schemaTypes/localizedSlug.ts`) |

```json
"name": [
  { "_key": "…", "language": "da", "value": "Italien" },
  { "_key": "…", "language": "en", "value": "Italy" }
]
```

The validation in `schemaTypes/languages.ts` checks `name`, `description` and `slug` against the `locale` documents:

- In **enabled** languages, a missing translation is an error, so the document can't be published.
- In languages that **aren't enabled yet**, it's a warning, so editors can see what's left while they translate.
- Missing `image.alt` text is only a warning, in every language.

Lists in the Studio show each document's English name. The [frontend README](../../travel-mate-frontend/README.md#languages) explains why TravelMate stores translations per field.

### Adding a language

1. Create a `locale` document with the name and code, and leave **Enabled** off. Every translated field now has a button under it that adds an empty row for the new language.
2. Translate the content, including the singletons under [Pages and settings](#pages-and-settings). Warnings show every document that's still missing the language. When none are left, switch **Enabled** on.
3. A developer runs `npm run typegen`, which adds the language to the frontend, and translates the menus and buttons that TypeScript then flags there.

### Slugs

Each language's slug is generated from the name in that language. `schemaTypes/slugify.ts` transliterates it to ASCII (`Akershus Fæstning` → `akershus-faestning`), so URLs never need percent-encoding. A slug must be unique across all languages within its type, so a URL always leads to one document.

## Generated types

`npm run typegen` extracts the schema and reads every `defineQuery` in the frontend, then writes `src/types/sanity.types.ts` there. Then `scripts/generate-languages.ts` writes the enabled `locale` documents to the frontend's `src/i18n/languages.generated.ts`, so TypeScript there flags every translation a newly enabled language is missing. The frontend repo must sit next to this one:

```text
TravelMate/
  travel-mate-cms/studio
  travel-mate-frontend
```

Run it after changing a schema or a query, and after enabling or disabling a language.

## Migrations

`migrations/` holds the scripts that changed existing content:

| Migration | What it does |
|---|---|
| `localize-to-arrays` | Turns `name`, `tagline`, `description`, `slug` and `image.alt` from one object with a field per language (`name.da`, `name.en`, …) into an internationalized array with one item per language |
| `fix-spelling` | Fixes the mistakes found in a spellcheck of all content, writes every apostrophe as a curly one (`’`), and remakes four English slugs that were kept from before the slugs were localized |
| `remove-featured` | Removes the old **Featured** checkbox from countries, cities and attractions, now that the home page carousels are picked by hand. Run it after `seed-home-page.ts`, which reads the ticked boxes |

Each one only changes what still needs changing, so running it again changes nothing. A migration runs as a dry run unless `--no-dry-run` is passed:

```bash
npx sanity migration run localize-to-arrays
npx sanity migration run localize-to-arrays --no-dry-run
```

The earlier migrations, which made the slugs and the image alt text localized in the first place, are in the git history.

## Seed scripts

`scripts/` holds the scripts that created the first version of a document. Each one only creates what doesn't exist yet, so running it again never overwrites what editors have changed. Add `-- --dry-run` to the navigation, pages and home page scripts to see what they would create without writing anything.

| Script | What it creates |
|---|---|
| `seed-locales.ts` | The `locale` documents for Danish, English and Spanish |
| `seed-navigation.ts` | The navigation, with the menus that used to be hardcoded in the frontend |
| `seed-pages.ts` | The about page, the privacy policy and the terms of use, from `scripts/data/pages.json` |
| `seed-home-page.ts` | The home page and the site settings, from `scripts/data/home.json`. The carousels get the places that had **Featured** ticked |

Run them in this order, then the migration that removes the featured checkbox:

```bash
npx sanity exec scripts/seed-locales.ts --with-user-token
npx sanity exec scripts/seed-navigation.ts --with-user-token
npx sanity exec scripts/seed-pages.ts --with-user-token
npx sanity exec scripts/seed-home-page.ts --with-user-token
npx sanity migration run remove-featured --no-dry-run
```
