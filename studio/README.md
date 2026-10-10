# TravelMate Studio

The Sanity Studio for TravelMate. Editors write countries, cities and attractions here in Danish, English and Spanish, and the [TravelMate frontend](../../travel-mate-frontend) reads them with GROQ.

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
| `npm run typegen` | Writes the query result types and the enabled languages to the frontend (see [Generated types](#generated-types)) |

## Content model

```text
Country
  └── City        (city.country → reference to Country)
       └── Attraction  (attraction.city → reference to City)
```

| Type | File | Fields |
|---|---|---|
| `country` | `schemaTypes/country.ts` | name, slug, code, tagline, description, image, featured |
| `city` | `schemaTypes/city.ts` | name, slug, country, tagline, description, image, location, website, featured |
| `attraction` | `schemaTypes/attraction.ts` | name, slug, city, category, tagline, description, image, address, location, website, featured |
| `locale` | `schemaTypes/locale.ts` | title, code, enabled |

Fields used by more than one type are defined once in `schemaTypes/fields.ts`. Ticking **Featured** shows the document on the frontend's home page.

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
2. Translate the content. Warnings show every document that's still missing the language. When none are left, switch **Enabled** on.
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

`migrations/` holds the script that moved existing content to the plugin's arrays:

| Migration | What it does |
|---|---|
| `localize-to-arrays` | Turns `name`, `tagline`, `description`, `slug` and `image.alt` from one object with a field per language (`name.da`, `name.en`, …) into an internationalized array with one item per language |

It only touches fields that still have the old shape, so running it again changes nothing. A migration runs as a dry run unless `--no-dry-run` is passed:

```bash
npx sanity migration run localize-to-arrays
npx sanity migration run localize-to-arrays --no-dry-run
```

The earlier migrations, which made the slugs and the image alt text localized in the first place, are in the git history.

`scripts/seed-locales.ts` created the `locale` documents for Danish, English and Spanish, and skips any that already exist:

```bash
npx sanity exec scripts/seed-locales.ts --with-user-token
```
