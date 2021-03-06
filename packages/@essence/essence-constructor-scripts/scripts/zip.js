/* eslint-disable no-console, no-process-exit, no-sync */
const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const AdmZip = require("adm-zip");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (...relativePath) => path.resolve(appDirectory, ...relativePath);
const packageJson = require(resolveApp("package.json"));
const packageJsonScripts = require(path.join(__dirname, "..", "package.json"));

// eslint-disable-next-line max-statements
function patchFiles() {
    const zip = new AdmZip();
    const zipPath = resolveApp("dist", `${packageJson.name}-${packageJson.version}.zip`);
    const files = [];

    if (!fs.existsSync(resolveApp("dist"))) {
        console.log();
        console.log(`Не могу найти сборку в папке ${chalk.cyan("dist")}`);
        console.log(`Необходимо собрать приложения с помощью ${chalk.cyan("yarn build")}!`);
        console.log();

        process.exit(1);
    }

    fs.readdirSync(resolveApp("dist")).forEach((fileName) => {
        files.push(fileName);
        zip.addLocalFile(resolveApp("dist", fileName));
    });

    if (fs.existsSync(resolveApp("src", "schema_manifest.json"))) {
        zip.addLocalFile(resolveApp("src", "schema_manifest.json"));
    }

    const config = {
        files: files.map((file) => `/${file}`),
        manifest: "/schema_manifest.json",
        name: packageJson.name,
        version: packageJson.version,
        versionapi: packageJsonScripts.apiversion,
    };

    zip.addFile("config.json", JSON.stringify(config, null, 2));
    zip.writeZip(zipPath);

    console.log(`You file: ${zipPath}`);
}

patchFiles();
