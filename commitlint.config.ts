import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      RuleConfigSeverity.Error,
      'always',
      ['repos', 'client', 'api']
    ]
  }
}

export default Configuration
