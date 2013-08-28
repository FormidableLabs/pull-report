#!/usr/bin/env node

/**
 * Pull request notifications.
 */
var pkg = require("./package.json"),

  _ = require("underscore"),
  async = require("async"),
  program = require("commander"),
  iniparser = require("iniparser"),
  GitHubApi = require("github"),

  HOME_PATH = process.env.HOME,
  GIT_CONFIG_PATH = [HOME_PATH, ".gitconfig"].join("/"),
  GIT_CONFIG = null,

  github;

// Try and get the .gitconfig.
try {
  GIT_CONFIG = iniparser.parseSync(GIT_CONFIG_PATH);
} catch (err) {
  // Passthrough.
}

/**
 * Get PRs for organization.
 *
 * @param   {object} opts       Options.
 * @param   {string} opts.org   Organization name
 * @param   {string} opts.users Users to filter (or `null`).
 */
function getPrs(opts, callback) {
  // Actions.
  async.auto({
    repos: function (cb) {
      github.repos.getFromOrg({
        org: opts.org,
        per_page: 100
      }, cb);
    },

    prs: ["repos", function (cb, results) {
      var repos = _.chain(results.repos)
        .map(function (repo) { return [repo.name, repo]; })
        .object()
        .value();

      async.each(results.repos, function (repo, mapCb) {
        github.pullRequests.getAll({
          user: opts.org,
          repo: repo.name,
          state: opts.state,
          per_page: 100
        }, function (err, prs) {
          if (prs && prs.length) {
            delete prs.meta;
            repos[repo.name].prs = prs;
          }

          return mapCb(err, prs);
        });
      }, function (err) {
        return cb(err, repos);
      });
    }]

  }, function (err, results) {
    if (err) { return callback(err); }

    var repos = {},
      entUrlRe = /api\/v[0-9]\/repos\//;

    // Iterate Repos.
    _.chain(results.prs)
      .filter(function (repo) { return repo.prs && repo.prs.length; })
      .sort(function (repo) { return repo.name; })
      .map(function (repo) {
        var repoData = _.pick(repo, "name");

        // Iterate PRs.
        repoData.prs = _.chain(repo.prs)
          .sort(function (pr) { return pr.number; })
          .map(function (pr) {
            var url = pr.url.replace(/pulls\/([0-9]+)$/, "pull/$1");

            // Mutate URLs to actual PR urls.
            if (entUrlRe.test(url)) {
              // Undo Enterprise hack.
              url = url.replace(entUrlRe, "");
            } else {
              // Normal GitHub.
              url = url.replace(
                "https://api.github.com/repos/",
                "https://github.com/");
            }

            return {
              user: (pr.user ? pr.user.login : null),
              assignee: (pr.assignee ? pr.assignee.login : null),
              number: pr.number,
              title: pr.title,
              url: url
            };
          })
          .filter(function (pr) {
            // Limit to assigned / requesting users.
            return !opts.users ||
              opts.users.indexOf(pr.assignee) > -1 ||
              opts.users.indexOf(pr.user) > -1;
          })
          .value();

        // Add in repo if 1+ filtered PRs.
        if (repoData.prs.length > 0) {
          repos[repo.name] = repoData;
        }
      });

    callback(null, repos);
  });
}

function list(val) {
  return val.split(",");
}

// Main.
if (require.main === module) {
  var ghConfig = GIT_CONFIG && GIT_CONFIG.github ? GIT_CONFIG.github : {};

  // Parse command line arguments.
  program
    .version(pkg.version)
    .option("-o, --org <orgs>", "List of 1+ organizations", list)
    .option("-u, --user [users]", "List of 0+ users", list)
    .option("-h, --host <name>", "GitHub Enterprise API host URL")
    .option("-s, --state <state>", "State of issues (default: open)")
    .option("-i, --insecure", "Allow unauthorized TLS (for proxies)")
    .option("--gh-user <username>", "GitHub user name")
    .option("--gh-pass <password>", "GitHub password")
    .option("--pr-url", "Add pull request URL to output")
    .parse(process.argv);

  // Defaults
  program.user      || (program.user = null);
  program.host      || (program.host = null);
  program.state     || (program.state = "open");
  program.ghUser    || (program.ghUser = ghConfig.user || null);
  program.ghPass    || (program.ghPass = ghConfig.password || null);
  program.prUrl     || (program.prUrl = false);
  program.insecure  || (program.insecure = false);

  // Validation
  if (!program.org) {
    throw new Error("Must specify 1+ organization names");
  }
  if (!(program.ghUser && program.ghPass)) {
    throw new Error("Must specify GitHub user / pass in .gitconfig or " +
      "on the command line");
  }
  if (["open", "closed"].indexOf(program.state) < 0) {
    throw new Error("Invalid issues state: " + program.state);
  }

  // Set up github auth.
  var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    timeout: 5000
  });

  // Hack in GH enterprise API support.
  //
  // Note: URL forms are different:
  // https://ORG_HOST/api/v3/API_PATH/...
  if (program.host && github.version === "3.0.0") {
    // Allow for proxy HTTPS mismatch. This is obviously an unsatisfactory
    // solution, but temporarily gets past:
    // `UNABLE_TO_VERIFY_LEAF_SIGNATURE` errors.
    if (program.insecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    // Patch host.
    github.constants.host = program.host;

    // Patch routes with "/api/v3"
    _.each(github[github.version].routes, function (group, groupName) {
      _.each(group, function (route, routeName) {
        if (route.url) {
          route.url = "/api/v3" + route.url;
        }
      });
    });
  }

  // Authenticate.
  github.authenticate({
    type: "basic",
    username: program.ghUser,
    password: program.ghPass,
  });

  // For each org,
  async.eachSeries(program.org, function (org, cb) {
    console.log("* " + org);

    // for each repo,
    getPrs({
      org: org,
      users: program.user,
      state: program.state
    }, function (err, repos) {
      // Short circuit error.
      if (err) { return cb(err); }

      _.each(repos, function (repo) {
        console.log("  * " + repo.name + ": (" + repo.prs.length + ")");

        // for each PR...
        _.each(repo.prs, function (pr) {
          console.log("    * " + pr.assignee + " / " + pr.user + " - " +
            pr.number + ": " + pr.title);
          if (program.prUrl) {
            console.log("      " + pr.url);
          }
        });

        console.log("");
      });

      // Done.
      console.log("");
      cb();
    });

  }, function (err) {
    if (err) { throw err; }
  });
}
