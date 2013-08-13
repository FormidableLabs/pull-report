#!/usr/bin/env node

/**
 * Pull request notifications.
 */
var pkg = require("./package.json"),
  program = require("commander");

// Parse command line arguments.
program
  .version(pkg.version)
  .parse(process.argv);

// Main.
if (require.main === module) {
  console.log("TODO HERE", program);
}
