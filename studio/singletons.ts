// Documents there's only one of, like the navigation. The Studio opens them directly by their fixed ID
// and they can't be created, duplicated or deleted
// Privacy policy and terms share the legalPage type, but each has its own document
export const SINGLETONS = [
  {id: 'homePage', type: 'homePage', title: 'Home page'},
  {id: 'aboutPage', type: 'aboutPage', title: 'About page'},
  {id: 'privacyPage', type: 'legalPage', title: 'Privacy policy'},
  {id: 'termsPage', type: 'legalPage', title: 'Terms of use'},
  {id: 'navigation', type: 'navigation', title: 'Navigation'},
  {id: 'siteSettings', type: 'siteSettings', title: 'Site settings'},
]

export const SINGLETON_TYPES = [...new Set(SINGLETONS.map(({type}) => type))]
