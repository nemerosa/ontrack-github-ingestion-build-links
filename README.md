ontrack-github-ingestion-build-links
====================================

GitHub Action used to inject build links in Ontrack. It must be used in a workflow which is [ingested](https://static.nemerosa.net/ontrack/release/latest/docs/doc/index.html#integration-github-ingestion) by Ontrack.

# Usage

```yaml
- id: links
  uses: nemerosa/ontrack-github-ingestion-build-links
  with:
    build-links: |-
       component: build-name
       library: #build-label
       other-component: a-build-name
```

The `build-links` must be a YAML map of project x build references:

* the key is the name of an existing Ontrack project
* the _build ref_ is either the exact name of an Ontrack build in Ontrack of, if starting with `#`, the label (or release property) associated with the build

By default, all specified links are _authoritative_ meaning that the provided list will cancel and replace any previous existing link. To just append the list of links to any existing one, add the `add-only` input:

```yaml
  with:
    add-only: true
    # ...
```

By default, the build referred to by the action is identified by the same workflow the action runs in. To target another build, other [input arguments](action.yml) can be used. For example, to look for a build by name in the _same project_:

```yaml
  with:
      build-name: <the name of the build in the same project>
      # ...
```

Other [input arguments](action.yml) are available.

# Links extraction

## From a NPM/Yarn `package-lock.json` file

A local `package-lock.json` NPM/Yarn JSON file can be used to extract the dependencies:

```yaml
with:
  build-links-from-package-json: |-
    - dependency: "@nemerosa/ontrack-github-action-client"
```

By default, the Ontrack project name is extracted from the library. In this example, this would give `ontrack-github-action-client` as the project name. It can be overridden using the `project` property. The code below is equivalent to the previous one:

```yaml
with:
  build-links-from-package-json: |-
    - dependency: "@nemerosa/ontrack-github-action-client"
      project: "ontrack-github-action-client"
```

The version is read from the `package-lock.json` `dependencies` node. For example, if:

```json
{
  "dependencies": {
    "@nemerosa/ontrack-github-action-client": {
      "version": "0.1.6",
      "resolved": "...",
      "integrity": "...",
      "requires": {
        "cross-fetch": "^3.1.5"
      }
    }
  }
}
```

then the version is `0.1.6`.

By default, the version is used as the build name. If the build label must be used instead, use the `build-label` property:

```yaml
with:
  build-links-from-package-json: |-
    - dependency: "@nemerosa/ontrack-github-action-client"
      # ...
      build-label: true
```

If the version needs a prefix in order to be identified as a build or a build label, it can be specified using the `prefix` property:

```yaml
with:
  build-links-from-package-json: |-
    - dependency: "@nemerosa/ontrack-github-action-client"
      # ...
      build-label: true
      prefix: "v"
```

In this example, if the version is `0.1.8`, the code will look for a build labelled with `v0.1.8`.
