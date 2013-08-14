# Pull Request Reporter
Create reports for open GitHub pull requests for organizations and users.

## Installation

You can install with NPM:

```
$ npm install -g pull-report
```

## Usage
`pull-report` can retrieve all open pull requests for 1+ organizations and
optionally filter by a user list.

```
$ pull-report --help

  Usage: pull-report.js [options]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -o, --org <orgs>    List of 1+ organizations
    -u, --user [users]  List of 0+ users
```

### Examples

Get all open pull requests for an organization:

```
$ pull-report --org FormidableLabs
* FormidableLabs
  * atlas-api-client: (2)
    * per-nilsson / ryan-roemer - 1: Feature: Awesome
    * per-nilsson / ryan-roemer - 2: Bug: Bar
```

Get open pull requests for multiple organizations:

```
$ pull-report --org FormidableLabs,WalmartLabs
```

Get PRs for multiple orgs, filtered to a user list:

```
$ pull-report \
  --org FormidableLabs,WalmartLabs \
  --user eastridge,ryan-roemer,alexlande,per-nilsson,rgerstenberger
```

### Limitations

There is a bit of inefficiency in the current underlying use of the GitHub API.
But, any issues should be relatively easy to fix and enhance.

* `pull-report` retrieves at most 100 pull requests for any repo.

## Licenses
Released under the [MIT](./LICENSE.txt) License.
