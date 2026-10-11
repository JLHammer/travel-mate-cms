// Documents there's only ever one of, like the navigation. The Studio opens each one directly
// by its fixed ID, and they can't be created, duplicated or deleted.
// The privacy policy and the terms share the legalPage type, but each has its own document
export const SINGLETONS = [
  {id: 'aboutPage', type: 'aboutPage', title: 'About page'},
  {id: 'privacyPage', type: 'legalPage', title: 'Privacy policy'},
  {id: 'termsPage', type: 'legalPage', title: 'Terms of use'},
  {id: 'navigation', type: 'navigation', title: 'Navigation'},
]

export const SINGLETON_TYPES = [...new Set(SINGLETONS.map(({type}) => type))]
