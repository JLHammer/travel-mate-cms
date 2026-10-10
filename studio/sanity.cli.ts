import {defineCliConfig} from 'sanity/cli'

// The frontend lives in a sibling repo next to travel-mate-cms
export const FRONTEND = '../../travel-mate-frontend'

export default defineCliConfig({
  api: {
    projectId: 'cc196r01',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: true,
  },
  typegen: {
    path: `${FRONTEND}/src/**/*.{ts,tsx}`,
    schema: 'schema.json',
    generates: `${FRONTEND}/src/types/sanity.types.ts`,
  },
})
