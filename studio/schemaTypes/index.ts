import {country} from './country'
import {city} from './city'
import {attraction} from './attraction'
import {aboutPage} from './aboutPage'
import {legalPage} from './legalPage'
import {navigation} from './navigation'
import {richText} from './richText'
import {locale} from './locale'

// The localized field types (internationalizedArrayString, …) come from the plugin in sanity.config.ts
export const schemaTypes = [
  country,
  city,
  attraction,
  aboutPage,
  legalPage,
  navigation,
  richText,
  locale,
]
