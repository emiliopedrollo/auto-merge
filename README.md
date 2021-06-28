# auto-merge
GitHub action to automate branch merging

## Usage

### Minimum setup

```yaml
on:
  push:
    branches:
      - "*"
jobs:
  merge-branch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: emiliopedrollo/auto-merge@v1.0.0
        with:
          github_token: ${{ github.token }}
          target_branch: 'master'
```

### Keeping a PR updated

```yaml
on:
  pull_request:
    branches: [ master ]
    types: [ opened, synchronize, reopened ]
    
jobs:
  merge-branch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: emiliopedrollo/auto-merge@v1.0.0
        with:
          github_token: ${{ github.token }}
          target_branch: ${{ github.sha }}
          source_ref: 'master'
```

Note: Use with caution, if there's another workflow that also modifies or update the repo some evil loop may occur.

### Using a custom message

```yaml
on:
  push:
    branches:
      - "*"
jobs:
  merge-branch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: emiliopedrollo/auto-merge@v1.0.0
        with:
          github_token: ${{ github.token }}
          target_branch: 'master'
          commit_message: 'Branch {target_branch} auto-merged {source_ref}'
```

## Inputs

### `github_token`

**Required** - A valid GitHub Token used to perform the merge.
This can be the [Token provided by GitHub Workflows](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token),
or a custom token set at a [workflow secret](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

The token provided by the Workflow is conveniently available as a context var: `${{ gihutb.token }}`.

### `source_ref`
**Optional** - The head to merge. This can be a branch name or a commit SHA1. If none is provided the SHA1 hash of the commit that triggered the workflow will be used. 

### `target_branch`
**Required** - The name of the base branch that the head will be merged into.

### `commit_message`
**Optional** - A custom commit message to the merge commit. You can place a (very limited) set of variables in the message enclosed in curly braces (`{}`).

The available vars are:
 - `source_ref`: The head of the merge (i.e. the branch name or commit SHA1 from the source)
 - `target_branch`: The base The branch name (i.e. The branch name of the destination)

The default commit message is the following:
```text
Merge {source_ref} into {target_branch}
```
