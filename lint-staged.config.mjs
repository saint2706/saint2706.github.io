export default {
  '*.{js,jsx}': ['eslint --fix --max-warnings=0'],
  '*.{js,jsx,json,css,html,md}': 'prettier --ignore-unknown --write',
};
