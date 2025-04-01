const checkUpdate = async () => {
  const packageData = await fetch(`https://registry.npmjs.com/visa2discord`)
    .then((response) => response.json())
    .catch(() => null);

  if (!packageData) {
    return;
  }

  const currentVersion = require("../../../package.json").version;
  const latestVersion = packageData["dist-tags"]?.latest;

  if (currentVersion !== latestVersion) {
    const change = `${currentVersion} --> ${latestVersion}`;
    console.log("\n\n");
    console.log(
      "\x1b[32m" +
        "-------------------------------------------------------------------------------"
    );
    console.log(
      "\x1b[32m" +
        "| visa2discord                                                         - [] X |"
    );
    console.log(
      "\x1b[32m" +
        "-------------------------------------------------------------------------------"
    );
    console.log(
      "\x1b[33m" +
        `|                 The module is\x1b[31m out of date!\x1b[33m                  |`
    );
    console.log(
      "\x1b[35m" +
        "|                         New version is available!                           |"
    );
    console.log(
      "\x1b[34m" +
        `|                                 ${change}                                   |`
    );
    console.log(
      "\x1b[36m" +
        '|                         Run "npm i visa2discord@latest"                     |'
    );
    console.log(
      "\x1b[36m" +
        "|                                 to update!                                  |"
    );
    console.log(
      "\x1b[37m" +
        `|                         View the full changelog here:                       |`
    );
    console.log(
      "\x1b[31m" +
        `| https://github.com/TejasLamba2006/visa2discord/releases/tag/${latestVersion}|`
    );
    console.log(
      "\x1b[32m" +
        "-------------------------------------------------------\x1b[37m"
    );
    console.log("\n\n");
  }
};

export default checkUpdate;
