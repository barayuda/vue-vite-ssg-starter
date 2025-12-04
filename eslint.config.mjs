import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  ignores: [
    '**/*.md',
  ],
  rules: {
    'no-console': ['off'],
    'no-alert': ['off'],
  },
})
