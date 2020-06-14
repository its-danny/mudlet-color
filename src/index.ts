#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const xml2js = require("xml2js");
const yargs = require("yargs");

const { argv } = yargs.usage("Usage: $0 -p [str] -t [str]").options({
  p: {
    alias: "path",
    type: "string",
    describe: "Path to profile",
  },
  t: {
    alias: "theme",
    type: "string",
    describe: "Name of theme",
  },
  s: {
    alias: "themes",
    type: "boolean",
    describe: "Get a list of valid themes",
  },
});

const themePath = `${path.join(__dirname, "..")}/themes/${argv.t}.yml`;
const profilePath = argv.p;

const getThemeList = () => {
  console.log("https://mayccoll.github.io/Gogh/\n");

  console.log(
    fs
      .readdirSync(`${path.join(__dirname, "..")}/themes`)
      .map((theme) => theme.replace(".yml", ""))
      .join(", "),
  );

  process.exit();
};

const checkPaths = () => {
  if (!fs.existsSync(themePath)) {
    console.log("Not a valid theme!");
    process.exit();
  }

  if (!fs.existsSync(profilePath)) {
    console.log("Can't find profile!");
    process.exit();
  }
};

const writeProfile = async () => {
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder();

  const theme = yaml.safeLoad(fs.readFileSync(themePath, "utf8"));
  const profile = fs.readFileSync(profilePath);

  try {
    const result = await parser.parseStringPromise(profile);

    Object.keys(theme).forEach((key) => {
      result.MudletPackage.HostPackage[0].Host[0][key] = theme[key];
    });

    fs.writeFileSync(profilePath, builder.buildObject(result));
    console.log("Profile updated!");
  } catch (err) {
    console.log("Can't parse profile!");
    process.exit();
  }
};

if (argv.s) {
  getThemeList();
}

if (argv.p && argv.t) {
  checkPaths();
  writeProfile();
}
