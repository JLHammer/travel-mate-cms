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
| `npm run typegen` | Writes the query result types to the frontend (see [Generated types](#generated-types)) |

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

Fields used by more than one type are defined once in `schemaTypes/fields.ts`. Ticking **Featured** shows the document on the frontend's home page.

## Languages

The languages are listed once in `schemaTypes/languages.ts`. Three object types in `schemaTypes/objects/` turn that list into one field per language:

| Type | Used for |
|---|---|
| `localeString` | Short text: `name`, `tagline`, `image.alt` |
| `localeText` | Longer text: `description` |
| `localeSlug` | The URL part: `slug` |

Validation requires every language on `name`, `description` and `slug`, so a document can't be published with a translation missing. Missing `image.alt` text only gives a warning. The [frontend README](../../travel-mate-frontend/README.md#languages) explains why TravelMate stores translations per field.

### Slugs

Each language's slug is generated from the name in that language. `schemaTypes/slugify.ts` transliterates it to ASCII (`Akershus Fæstning` → `akershus-faestning`), so URLs never need percent-encoding. A slug must be unique across all languages within its type, so a URL always leads to one document.

## Generated types

`npm run typegen` extracts the schema and reads every `defineQuery` in the frontend, then writes `src/types/sanity.types.ts` there. The frontend repo must sit next to this one:

```text
TravelMate/
  travel-mate-cms/studio
  travel-mate-frontend
```

Run it after changing a schema or a query.

## Migrations

`migrations/` holds the scripts that moved existing content to the localized fields:

| Migration | What it does |
|---|---|
| `localize-slugs` | Turns a plain `slug` into a `localeSlug`. The old slug becomes the English one, so existing links still work |
| `localize-image-alt` | Turns a plain `image.alt` string into a `localeString` |

Each one only touches documents that still have the old shape, so running it again changes nothing. A migration runs as a dry run unless `--no-dry-run` is passed:

```bash
npx sanity migration run localize-slugs
npx sanity migration run localize-slugs --no-dry-run
```
