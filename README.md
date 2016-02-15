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
    -H, --host <name>     GitHub Enterprise API host URL
    -s, --state <state>   State of issues (default: open)
    -i, --insecure        Allow unauthorized TLS (for proxies)
    -t, --tmpl <path>     Handlebars template path
    --html                Display report as HTML
    --gh-user <username>  GitHub user name
    --gh-pass <password>  GitHub pass
	--gh-token <token>    Github token
    --pr-url              Add pull request URL to output
```

### Requirements

`org`: You must enter 1+ organization names.

### Authentication

`pull-report` reads your "~/.gitconfig" file looking for an entry like:

```
[github]
  user = MY_USERNAME
  password = MY_PASSWORD
  token = MY_TOKEN
```

You can alternately specify / override values on the command line:

```
$ pull-report \
  --org FormidableLabs \
  --gh-user MY_USERNAME \
  --gh-pass MY_PASSWORD
```

If you user two factor auth (or do not want to specify a password on
the command line or in your config file, you may instead specify a
personal access token.  You should generate a token from your github
user account with NO additional privileges and either include it in
your .gitconfig file or specify it on the command line.

### GitHub Enterprise

Pull report has experimental support for
[GitHub Enterprise](https://enterprise.github.com/) repositories. However,
there are a few things to note:

* **Brittle Implementation**: We hack up the host and route paths internally
  in the underlying [node-github](https://github.com/ajaxorg/node-github)
  library. The underlying library could change how its internals work and
  our hack would be broken.
* **Disables TLS Cert Matching**: Pull report has an `--insecure` option to
  disable the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable to avoid an
  `UNABLE_TO_VERIFY_LEAF_SIGNATURE` error when hitting GitHub enterprise through
  a VPN or proxy. Do not use the flag if you can't otherwise verify you are
  going through a safe transport mechanism (i.e., in other programs that **do**
  verify).

To retrieve reports from GitHub Enterprise, set the `--host` flag to the
host name of your GitHub Enterprise host.

### Examples

Get all of the open pull requests for **one organization**:

```
$ pull-report --org FormidableLabs
* FormidableLabs:
  * work-for-us: (1)
    * joe-user / jane-user - 1: Added GUI to job posting API

  * chai-jq: (1)
    * jane-user / joe-user - 8: fix DOC anchor links
```

Get open pull requests for **multiple organizations**:

```
$ pull-report --org FormidableLabs,ORG2
```

Get PRs for multiple orgs, filtered to a **user list**:

```
$ pull-report \
  --org FormidableLabs,ORG2 \
  --user ryan-roemer,USER2,USER3,USER4,USER5
```

Get PRs for a **GitHub enterprise** organization:

```
$ pull-report \
  --host custom-gh-enterprise.example.com \
  --org ORG1
```

### Templates

Pull report uses [Handlebars.js](http://handlebarsjs.com/) templates for
rendering reports. The built-in templates available are:

* **[text.hbs](./templates/text.hbs)**: Default pure text template. Used if no
  other option or templates specified.
* **[html.hbs](./templates/html.hbs)**: HTML output templates. Used if the
  `--html` option is provided. The provided HTML template has some
  preliminary classes for user styling (in another HTML document) and
  a few random [Pure CSS](http://purecss.io/) classes that are currently
  being used in another project. (We'll look to shore this up in future
  releases.)

Custom templates can be specified using the command option:
`--tmpl /PATH/TO/TEMPLATE.hbs`.

### Limitations

There is a bit of inefficiency in the current underlying use of the GitHub API.
But, any issues should be relatively easy to fix and enhance.

* `pull-report` retrieves at most 100 pull requests for any repo.

## Licenses
Copyright 2013-2014 Formidable Labs, Inc.
Released under the [MIT](./LICENSE.txt) License.
