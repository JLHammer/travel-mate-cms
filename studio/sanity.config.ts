import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {schemaTypes} from './schemaTypes'
import {fetchLocales, isAdministrator} from './schemaTypes/languages'
import {localizedSlug} from './schemaTypes/localizedSlug'
import {SINGLETON_TYPES} from './singletons'
import {structure} from './structure'

// Deleting or unpublishing a language would orphan every translation stored under its code,
// and a singleton like the navigation must always exist exactly once
const LOCKED_ACTIONS = ['delete', 'unpublish', 'duplicate']
const LOCKED_TYPES = ['locale', ...SINGLETON_TYPES]

export default defineConfig({
  name: 'default',
  title: 'TravelMate',

  projectId: 'cc196r01',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    // One array item per language, e.g. name: [{language: 'da', value: 'Italien'}, …].
    // The languages come from the locale documents, so adding one needs no code
    internationalizedArray({
      languages: fetchLocales,
      fieldTypes: ['string', 'text', localizedSlug],
      // Only the buttons under each field. The bar at the top of a document is labelled
      // "Add translation" but only adds empty rows, which reads as if it translates
      buttonLocations: ['field'],
      languageDisplay: 'titleAndCode',
    }),
  ],

  schema: {
    types: schemaTypes,
    // Singletons are opened from the sidebar, so they're left out of "Create new"
    templates: (prev) => prev.filter(({schemaType}) => !SINGLETON_TYPES.includes(schemaType)),
  },

  document: {
    actions: (prev, {schemaType}) =>
      LOCKED_TYPES.includes(schemaType)
        ? prev.filter(({action}) => !action || !LOCKED_ACTIONS.includes(action))
        : prev,
    newDocumentOptions: (prev, {currentUser}) =>
      isAdministrator(currentUser) ? prev : prev.filter(({templateId}) => templateId !== 'locale'),
  },
})
