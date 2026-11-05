export default {
  '*.{js,jsx}': ['eslint --fix --max-warnings=0'],
  '*.{js,jsx,mjs,cjs,ts,json,css,html,md,yml,yaml}': 'prettier --ignore-unknown --write',
};
