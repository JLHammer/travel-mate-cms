// Documents there's only ever one of, like the navigation. The Studio opens each one directly
// by its fixed ID, and they can't be created, duplicated or deleted
export const SINGLETONS = [{id: 'navigation', type: 'navigation', title: 'Navigation'}]

export const SINGLETON_TYPES = SINGLETONS.map(({type}) => type)
