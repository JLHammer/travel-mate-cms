import type {StructureResolver} from 'sanity/structure'
import {isAdministrator} from './schemaTypes/languages'

// Content first, then the languages, which only administrators see
export const structure: StructureResolver = (S, {currentUser}) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'locale'),
      ...(isAdministrator(currentUser)
        ? [S.divider(), S.documentTypeListItem('locale').title('Languages')]
        : []),
    ])
