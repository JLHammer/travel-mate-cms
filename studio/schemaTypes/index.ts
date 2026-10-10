import {country} from './country'
import {city} from './city'
import {attraction} from './attraction'
import {locale} from './locale'

// The localized field types (internationalizedArrayString, …) come from the plugin in sanity.config.ts
export const schemaTypes = [country, city, attraction, locale]
