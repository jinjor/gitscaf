const cp = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const argv = require("argv");

const cleanup = [];
process.on("exit", function(code, signal) {
  if (code || signal === "SIGINT") {
    for (let c of cleanup) {
      c();
    }
  }
});

argv.info("Usage: gitscaf user/project src target [options]");
argv.option([
  {
    name: "server",
    type: "string",
    description: "Use custom server (default: github.com)"
  },
  {
    name: "protocol",
    type: "string",
    description: "Use one of [ https, git ] (default: https)"
  },
  {
    name: "branch",
    short: "b",
    type: "string",
    description: "Fetch a particular branch (default: master)"
  }
]);
const { targets, options } = argv.run();
const [userAndProject, src, target] = targets;
if (!target) {
  argv.help();
  process.exit(1);
}
const tmpDir = "/tmp/gitscaf";
const templatePath = path.join(tmpDir, src);
if (!path.relative(tmpDir, templatePath)) {
  console.error("WARN: Using the top level directory is not recommended");
}
const server = options.server || "github.com";
const protocol = options.protocol || "https";
const branch = options.branch || "master";

const gitUrl =
  protocol === "git"
    ? `git@${server}:${userAndProject}.git`
    : protocol === "https"
      ? `https://${server}/${userAndProject}.git`
      : (console.error(`Unsupported protocol: ${protocol}`), process.exit(1));

if (fs.existsSync(target)) {
  console.error(`Target "${target}" already exists`);
  process.exit(1);
}
cleanup.push(() => fs.removeSync(target));

fs.removeSync(tmpDir);
if (userAndProject.startsWith("/") || userAndProject.startsWith(".")) {
  // debug mode
  const projectPath = path.resolve(userAndProject);
  fs.copySync(projectPath, tmpDir);
} else {
  cleanup.push(() => fs.removeSync(tmpDir));
  cp.execSync(`git clone ${gitUrl} ${tmpDir} -b ${branch} --depth 1 --quiet`);
}
fs.copySync(templatePath, target);
fs.removeSync(tmpDir);
