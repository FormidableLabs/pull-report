# Pull Request Reporter
Create reports for open GitHub pull requests for organizations and users.

## Installation

You can install with NPM:

```
$ npm install -g pull-report
```

## Usage
`pull-report` can retrieve all open pull requests for 1+
[GitHub organizations](https://github.com/blog/674-introducing-organizations)
and optionally filter by a user list.

```
$ pull-report --help

  Usage: pull-report.js [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -o, --org <orgs>      List of 1+ organizations
    -u, --user [users]    List of 0+ users
    --gh-user <username>  GitHub user name
    --gh-pass <password>  GitHub password
```

### Requirements

`org`: You must enter 1+ organization names.

### Authentication

`pull-report` reads your "~/.gitconfig" file looking for an entry like:

```
[github]
  user = MY_USERNAME
  password = MY_PASSWORD
```

You can alternately specify / override values on the command line:

```
$ pull-report \
  --org FormidableLabs \
  --gh-user MY_USERNAME \
  --gh-pass MY_PASSWORD
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
$ pull-report --org FormidableLabs,ORG2
```

Get PRs for multiple orgs, filtered to a user list:

```
$ pull-report \
  --org FormidableLabs,ORG2 \
  --user ryan-roemer,USER2,USER3,USER4,USER5
```

### Limitations

There is a bit of inefficiency in the current underlying use of the GitHub API.
But, any issues should be relatively easy to fix and enhance.

* `pull-report` retrieves at most 100 pull requests for any repo.

## Licenses
Released under the [MIT](./LICENSE.txt) License.
