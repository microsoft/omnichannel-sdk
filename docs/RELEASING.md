# Releasing @microsoft/ocsdk

## How npm Publishing Works

This package uses **GitHub Actions OIDC trusted publishing** — no npm tokens or secrets are needed. The `npm-release.yml` workflow handles everything.

### Dev Versions (Automatic)

Every push to `main` automatically publishes a dev version to npm:

```
0.5.21-main.abc1234
       ^^^^^^^^^^^^
       branch + short commit SHA (via version-from-git)
```

- **npm tag**: `main` (not `latest`)
- **Install**: `npm install @microsoft/ocsdk@main`
- **Triggered by**: Any merge/push to the `main` branch

### Release Versions (Manual — Tag Push)

To publish a release version (e.g. `0.5.22`):

1. **Update the version** in `package.json`:
   ```bash
   # Edit package.json version field to the new version
   ```

2. **Update the changelog** in `CHANGELOG.md`

3. **Commit and push** to main:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Bump version to 0.5.22"
   git push
   ```

4. **Create and push a tag**:
   ```bash
   git tag v0.5.22
   git push origin v0.5.22
   ```

5. The `npm-release.yml` workflow will:
   - Build the package (`npm run build:prod`)
   - Publish to npm with `--tag latest`
   - Include provenance attestation (visible on npmjs.com)

### CDN Release

The CDN release is handled separately by `release.yml` (triggered on push to main and tags). CDN publishing is currently disabled (`PUBLISH_TO_CDN: false`). To enable, set the flag to `true` and configure the blob storage connection strings.

### Verifying a Publish

```bash
# Check latest release version
npm view @microsoft/ocsdk version

# Check all dist-tags (latest + main)
npm view @microsoft/ocsdk dist-tags

# Check a specific dev version
npm view @microsoft/ocsdk@main version
```

### Tag Format

| Tag pattern | What publishes | npm dist-tag |
|-------------|---------------|--------------|
| `v*` (e.g. `v0.5.22`) | Release version from `package.json` | `latest` |
| Push to `main` | Dev version `X.Y.Z-main.<sha>` | `main` |

### Important Notes

- **Burned versions**: If a publish fails, that version number is consumed by npm. You must bump to the next version.
- **Trusted publisher**: Configured on npmjs.com to trust `microsoft/omnichannel-sdk` → `npm-release.yml`. No npm tokens needed.
- **Provenance**: All publishes include a signed provenance statement verifiable on npmjs.com.
