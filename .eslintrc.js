module.exports = {
    "env": {
        browser: true,
        "es6": true,
    },
    "extends": ["eslint:recommended"],
    "rules": {
        "func-style": [2, "expression", { "allowArrowFunctions": true }],
        "max-len": ["error", { code: 130, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
        "object-curly-spacing": ["error", "always"],
    },
    globals: {
        $: true,
        componentHandler: true,
    }
};