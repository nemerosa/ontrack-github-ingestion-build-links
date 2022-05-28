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
