import {defineField, defineType, type CustomValidator} from 'sanity'
import {API_VERSION, isAdministrator} from './languages'

// Two languages can't share a code, or their translations would mix
const isUniqueCode: CustomValidator<string | undefined> = async (code, {document, getClient}) => {
  if (!code || !document) return true

  const id = document._id.replace(/^drafts\./, '')
  const params = {code, draft: `drafts.${id}`, published: id}
  const query = `!defined(*[_type == "locale" && code == $code && !(_id in [$draft, $published])][0]._id)`

  return (await getClient({apiVersion: API_VERSION}).fetch(query, params))
    ? true
    : 'Another language already uses this code'
}

// Translations are saved under the code, so changing it later would orphan all of them
const isUnchangedOnceSaved: CustomValidator<string | undefined> = async (
  code,
  {document, getClient},
) => {
  if (!document) return true

  const id = document._id.replace(/^drafts\./, '')
  const published = await getClient({apiVersion: API_VERSION}).fetch<string | null>(
    `*[_id == $id][0].code`,
    {id},
  )

  return !published || published === code
    ? true
    : `Translations are stored under "${published}", so the code can't change once it's published`
}

// A language the content can be translated into, only administrators can see and edit these
export const locale = defineType({
  name: 'locale',
  title: 'Language',
  type: 'document',
  readOnly: ({currentUser}) => !isAdministrator(currentUser),

  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      type: 'string',
      description: 'Written in the language itself, e.g. "Dansk" or "Español"',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      description:
        'Two-letter ISO 639-1 code, e.g. "da". Translations are stored under it, so it can\'t change once published',
      validation: (rule) => [
        rule
          .required()
          .regex(/^[a-z]{2}$/, {name: 'two lowercase letters'})
          .error('Use the two-letter ISO 639-1 code in lowercase, e.g. da'),
        rule.custom(isUniqueCode),
        rule.custom(isUnchangedOnceSaved),
      ],
    }),

    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      initialValue: false,
      description:
        'Switch on once every country, city and attraction is translated. Missing translations are errors in enabled languages and warnings in the others. The website shows the language after the developer has run "npm run typegen" and added the translated menus and buttons',
    }),
  ],

  preview: {
    select: {title: 'title', code: 'code', enabled: 'enabled'},
    prepare: ({title, code, enabled}) => ({
      title,
      subtitle: `${code ?? '–'} · ${enabled ? 'Enabled' : 'Not enabled'}`,
    }),
  },
})
