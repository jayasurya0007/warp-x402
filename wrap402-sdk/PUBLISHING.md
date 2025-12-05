# Publishing warp402-sdk to NPM

## Prerequisites

1. **NPM Account**: You need an NPM account. Create one at https://www.npmjs.com/signup
2. **Login**: Login to npm from terminal:
   ```bash
   npm login
   ```

## Pre-Publish Checklist

✅ Build succeeds without errors
✅ Package.json has correct metadata
✅ README.md is comprehensive
✅ LICENSE file exists
✅ .npmignore excludes source files
✅ Version number is correct (currently 1.0.0)

## Publishing Steps

### 1. Final Build & Test
```bash
cd /home/madtitan/wrap-x402/wrap402-sdk
npm run build
npm test
```

### 2. Check Package Contents
```bash
npm pack --dry-run
```
This shows what will be published (should be ~18-20 KB with 59 files)

### 3. Publish to NPM
```bash
# For first release
npm publish

# For scoped package (if you want @yourname/warp402-sdk)
npm publish --access public
```

### 4. Verify Publication
```bash
npm view warp402-sdk
```

## Post-Publish

After publishing, users can install with:
```bash
npm install warp402-sdk
```

## Version Updates

For future updates:
```bash
# Patch release (1.0.1) - bug fixes
npm version patch

# Minor release (1.1.0) - new features
npm version minor

# Major release (2.0.0) - breaking changes
npm version major

# Then publish
npm publish
```

## Troubleshooting

### Package name already taken
If `warp402-sdk` is taken, you can:
1. Use a scoped package: `@jayasurya0007/warp402-sdk`
   - Update package.json: `"name": "@jayasurya0007/warp402-sdk"`
   - Publish: `npm publish --access public`

2. Choose a different name: `warp-x402-sdk` or `avalanche-warp402`

### Build errors with ethers
The prebuild script automatically handles this by moving `ethers/src.ts` temporarily.

## Current Package Status

- **Name**: warp402-sdk
- **Version**: 1.0.0
- **Size**: 18.7 KB (gzipped)
- **Files**: 59 (includes all dist/, README, LICENSE)
- **Dependencies**: ethers@^6.9.0

## Notes

- The package includes automatic workaround for ethers v6 TypeScript issues
- Source TypeScript files are excluded from npm package
- Only compiled JavaScript + TypeScript declarations are published
