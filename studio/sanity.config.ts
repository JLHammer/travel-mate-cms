import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {schemaTypes} from './schemaTypes'
import {fetchLocales, isAdministrator} from './schemaTypes/languages'
import {localizedSlug} from './schemaTypes/localizedSlug'
import {SINGLETON_TYPES} from './singletons'
import {structure} from './structure'

// Deleting or unpublishing a language would orphan every translation saved under its code
// and singletons like the navigation should always exist exactly once
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
    // One array item per language, like name: [{language: 'da', value: 'Italien'}, …]
    // Languages come from the locale documents, so adding one needs no code
    internationalizedArray({
      languages: fetchLocales,
      fieldTypes: ['string', 'text', 'richText', localizedSlug],
      // Only the buttons under each field. The bar at the top says "Add translation"
      // but only adds empty rows, which looks like it translates
      buttonLocations: ['field'],
      languageDisplay: 'titleAndCode',
    }),
  ],

  schema: {
    types: schemaTypes,
    // Singletons open from the sidebar, so leave them out of "Create new"
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
