// eslint.security.config.js
// Security-focused ESLint rules — import into your main eslint config
// Install: pnpm add -D eslint-plugin-security eslint-plugin-no-secrets

import security from 'eslint-plugin-security';
import noSecrets from 'eslint-plugin-no-secrets';

export default [
  {
    plugins: {
      security,
      'no-secrets': noSecrets,
    },
    rules: {
      // ── eslint-plugin-security ──

      // Detect unsafe regex (ReDoS)
      'security/detect-unsafe-regex': 'error',

      // Detect buffer noAssert (Node.js)
      'security/detect-buffer-noassert': 'error',

      // Detect child_process usage
      'security/detect-child-process': 'warn',

      // Detect eval() and similar
      'security/detect-eval-with-expression': 'error',

      // Detect non-literal fs calls (path traversal)
      'security/detect-non-literal-fs-filename': 'warn',

      // Detect non-literal require (code injection)
      'security/detect-non-literal-require': 'warn',

      // Detect non-literal regexp (ReDoS)
      'security/detect-non-literal-regexp': 'warn',

      // Detect possible timing attacks in string comparison
      'security/detect-possible-timing-attacks': 'warn',

      // Detect pseudoRandomBytes (use crypto.randomBytes instead)
      'security/detect-pseudoRandomBytes': 'error',

      // Detect SQL injection via string concatenation
      'security/detect-sql-literal-injection': 'error',

      // Object injection (bracket notation with user input)
      'security/detect-object-injection': 'off', // too many false positives in React

      // ── eslint-plugin-no-secrets ──

      // Detect hardcoded secrets, API keys, tokens
      'no-secrets/no-secrets': ['error', {
        tolerance: 4.5,
        additionalDelimiters: ['_', '-'],
        ignoreContent: [
          // Ignore test fixtures and mock data
          /^test_/,
          /^mock_/,
          /^fake_/,
          /^placeholder/,
          // Ignore common non-secret patterns
          /^https?:\/\//,
          /^localhost/,
        ],
      }],
    },
  },

  // Additional manual rules for common vulnerabilities
  {
    rules: {
      // Prevent dangerouslySetInnerHTML (XSS vector)
      'react/no-danger': 'error',

      // No document.write (XSS vector)
      'no-restricted-properties': ['error',
        { object: 'document', property: 'write', message: 'Use DOM manipulation instead of document.write (XSS risk)' },
        { object: 'document', property: 'writeln', message: 'Use DOM manipulation instead of document.writeln (XSS risk)' },
      ],

      // No innerHTML assignment
      'no-restricted-syntax': ['error',
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message: 'Do not use innerHTML — use textContent or React rendering (XSS risk)',
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'Do not use insertAdjacentHTML — use DOM methods (XSS risk)',
        },
      ],
    },
  },
];
