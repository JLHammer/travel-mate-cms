import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'cc196r01',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: true,
  },
})
