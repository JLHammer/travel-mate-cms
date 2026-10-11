import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {isAdministrator} from './schemaTypes/languages'
import {SINGLETON_TYPES, SINGLETONS} from './singletons'

// A singleton opens its one document straight away instead of a list
const singletonItem = (S: StructureBuilder, {id, type, title}: (typeof SINGLETONS)[number]) =>
  S.listItem()
    .id(id)
    .title(title)
    .schemaType(type)
    .child(S.document().schemaType(type).documentId(id).title(title))

// Content first, then the site-wide settings, then the languages, which only administrators see
export const structure: StructureResolver = (S, {currentUser}) =>
  S.list()
    .title('Content')
    .items([
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'locale' && !SINGLETON_TYPES.includes(item.getId() ?? ''),
      ),
      S.divider(),
      ...SINGLETONS.map((singleton) => singletonItem(S, singleton)),
      ...(isAdministrator(currentUser)
        ? [S.divider(), S.documentTypeListItem('locale').title('Languages')]
        : []),
    ])
