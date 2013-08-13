#!/usr/bin/env node

/**
 * Pull request notifications.
 */
var iniparser = require("iniparser"),
  pkg = require("./package.json"),
  program = require("commander"),
  HOME_PATH = process.env.HOME,
  GIT_CONFIG_PATH = [HOME_PATH, ".gitconfig"].join("/"),
  GIT_CONFIG;

// Parse command line arguments.
program
  .version(pkg.version)
  .parse(process.argv);

// Parse gitconfig file.
GIT_CONFIG = iniparser.parseSync(GIT_CONFIG_PATH);

// Main.
if (require.main === module) {
  console.log("TODO HERE", GIT_CONFIG);
}
