#!/usr/bin/env node

import chalk from "chalk";
import { existsSync, readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";
import path from "path";
import { fileURLToPath } from "url";
import xml2js from "xml2js";
import yargs from "yargs";

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// print headline & current version

const colors = [
  chalk.red,
  chalk.yellow,
  chalk.green,
  chalk.cyan,
  chalk.blue,
  chalk.magenta,
];

const headline = "mudlet-color"
  .split("")
  .map((c) => colors[Math.floor(Math.random() * colors.length)](c))
  .join("");

console.log(
  `${headline} v${
    JSON.parse(
      readFileSync(`${path.join(__dirname, "..")}/package.json`, "utf8")
    ).version
  } ...\n`
);

// setup yargs

const { argv } = yargs
  .usage("Usage: mudlet-color -p [path-to-profile] -t [theme-name]")
  .options({
    p: {
      alias: "path",
      type: "string",
      describe: "Path to profile",
      demandOption: true,
    },
    t: {
      alias: "theme",
      type: "string",
      describe: "Name of theme",
      demandOption: true,
    },
  });

// setup paths

const themePath = `${path.join(__dirname, "..")}/themes/${argv.t}.yml`;
const profilePath = argv.p;

// exit if either profile or theme path is invalid

const checkPaths = () => {
  if (!existsSync(themePath)) {
    console.log(chalk.red("Not a valid theme!"));
    process.exit();
  }

  if (!existsSync(profilePath)) {
    console.log(chalk.red("Can't find profile!"));
    process.exit();
  }
};

// write the colors from the given theme to the given profile

const writeProfile = async () => {
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder();

  const theme = yaml.safeLoad(readFileSync(themePath, "utf8"));
  const profile = readFileSync(profilePath);

  try {
    const result = await parser.parseStringPromise(profile);

    Object.keys(theme).forEach((key) => {
      result.MudletPackage.HostPackage[0].Host[0][key] = theme[key];
      result.MudletPackage.HostPackage[0].Host[0][`${key}2`] = theme[key];
    });

    result.MudletPackage.HostPackage[0].Host[0].mCommandFgColor =
      theme.mFgColor;
    result.MudletPackage.HostPackage[0].Host[0].mCommandLineFgColor =
      theme.mFgColor;

    result.MudletPackage.HostPackage[0].Host[0].mCommandBgColor =
      theme.mBgColor;
    result.MudletPackage.HostPackage[0].Host[0].mCommandLineBgColor =
      theme.mBgColor;

    writeFileSync(profilePath, builder.buildObject(result));
    console.log(chalk.cyan("Profile updated!"));
  } catch (err) {
    console.log(chalk.red("Can't parse profile!"));
    process.exit();
  }
};

// if both path and theme are passed, get at it

if (argv.p && argv.t) {
  checkPaths();
  writeProfile();
}
