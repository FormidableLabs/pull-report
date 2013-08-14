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
  GIT_CONFIG = iniparser.parseSync(GIT_CONFIG_PATH),
  TEAM = "FormidableLabs",

  github;

// Parse command line arguments.
program
  .version(pkg.version)
  .parse(process.argv);

// Set up github auth.
var github = new GitHubApi({
  // required
  version: "3.0.0",
  // optional
  timeout: 5000
});

// Main.
if (require.main === module) {
  // Authenticate.
  github.authenticate({
    type: "basic",
    username: GIT_CONFIG.github.user,
    password: GIT_CONFIG.github.password
  });

  // Actions.
  async.auto({
    org: function (cb) {
      github.orgs.get({
        org: TEAM,
        per_page: 100
      }, cb);
    },

    orgRepos: function (cb, results) {
      github.repos.getFromOrg({
        org: TEAM,
        per_page: 100
      }, cb);
    },

    prs: ["orgRepos", function (cb, results) {
      var repos = _.chain(results.orgRepos)
        .map(function (repo) { return [repo.name, repo]; })
        .object()
        .value()

      async.each(results.orgRepos, function (repo, mapCb) {
        github.pullRequests.getAll({
          user: TEAM,
          repo: repo.name,
          state: "open",
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
    if (err) { throw err; }

    // Iterate Repos.
    _.chain(results.prs)
      .filter(function (repo) { return repo.prs && repo.prs.length; })
      .sort(function (repo) { return repo.name; })
      .each(function (repo) {
        console.log("* " + repo.name + ": (" + repo.prs.length + ")");

        // Iterate PRs.
        _.chain(repo.prs)
          .sort(function (pr) { return pr.number; })
          .each(function (pr) {
            var assignee = pr.assignee ? pr.assignee.login : null;
            console.log("  * " + assignee + " - " + pr.number + ": " +
              pr.title);
          });
      });
  })

}
