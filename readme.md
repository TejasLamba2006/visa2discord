# visa2discord

For your discord utilities

# Table of contents

- [visa2discord](#visa2discord)
- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Functions](#functions)
  - [Sleep](#sleep)
  - [passGen](#passgen)
  - [AutoThreadJoiner](#autothreadjoiner)
  - [Clean Code](#clean-code)
  - [Split MessageRegex](#split-messageregex)
  - [Discord Timestamp](#discord-timestamp)
  - [Discord activity generator](#discord-activity-generator)
  - [Disable Buttons](#disable-buttons)
  - [Transcripts](#transcripts)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Support](#support)
- [Disclaimer](#disclaimer)
- [Changelogs](#changelogs)
- [End](#end)

---

# Installation

- To install this package, you can use the following command:

  ```bash
  npm i visa2discord
  ```

- To install this package, you can also use the following command:

  ```bash
  yarn add visa2discord
  ```

---

# Functions

## Sleep

- The `sleep` function is used to introduce a delay in the execution of code. It can be useful in scenarios where you want to pause the execution for a specific period of time.
- Usage

  ```js
  const { sleep } = require('visa2discord');

  async function example() {
    console.log('Before sleep');
    await sleep(2000); // Sleep for 2000 milliseconds (2 seconds)
    console.log('After sleep');
  }

  example();
  ```

## passGen

- The `passGen` function is used to generate a random password.
- Usage

  ```js
  const { passGen } = require('visa2discord');

  const password = passGen(6) // Generate a password with 6 characters
  console.log('Generated password:', password);

  ```

- Example output

  ```
  Generated password: 5a2d3f
  ```

## AutoThreadJoiner

- The `AutoThreadJoiner` function is used to automatically join threads.
- Usage

  ```js
  const { Client } = require('discord.js');
  const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS'] });
  const { AutoThreadJoiner } = require('visa2discord');
  AutoThreadJoiner(client) // Automatically join threads
  ```

## Clean Code

- The `cleanCode` function is used to escape mentions and codeblocks in a given text string.
- Usage

  ```js
  const { cleanCode } = require('visa2discord');
  const code = 'const message = "Hello, this is a test message."';
  const cleanedCode = cleanCode(code);
  console.log('Cleaned code:', cleanedCode);
  ```

- Example output

  ```
  Cleaned code: const message = "Hello, this is a test message."
  ```

## Split MessageRegex

- The `splitMessageRegex` function is used to split a message into multiple messages to avoid the 2000 character limit by Discord.
- Parameters
  - `text`: The message to split into parts.
  - options (`optional`): An object containing the following properties:
    - `maxLength`: The maximum length of each part (default: `2000`).
    - `regex`: The regular expression to use as the delimiter (default: `/\n/g`).
    - `prepend`: The string to prepend to each part (default: `''`).
    - `append`: The string to append to each part (default: `''`).
- Usage

  ````js
  const { splitMessageRegex } = require('visa2discord');

  const message = `This is a long message that needs to be split into multiple parts.\nIt contains multiple lines and exceeds the maximum message length.`;

  const parts = splitMessageRegex(message, {
    maxLength: 50,
    regex: /\n/g,
    prepend: '```',
    append: '```'
  });

  console.log('Message parts:', parts);
  ````

- Example output

  ````json
    Message parts: [
    '```This is a long message that needs to be split into multiple parts.```',
    '```It contains multiple lines and exceeds the maximum message length.```'
    ]
  ````

## Discord Timestamp

- The `discordTimestamp` function is used to generate a discord timestamp.
- Usage

  ```js
  const { discordTimestamp } = require('visa2discord');
  const time = Date.now(); // Current time
  const type = 'f'; // type of timestamp

  const timestamp = discordTimestamp(time, type);
  console.log('Discord timestamp:', timestamp);
  ```

- Here are the types to use and their outputs on Discord:
- `d` => 03/05/2023
- `D` => March 5, 2023
- `t` => 2:22 PM
- `T` => 2:22:00 PM
- `f` => March 5, 2023 2:22 PM
- `F` => Sunday, March 5, 2023 2:22 PM
- `R` => A minute ago

## Discord activity generator

- The `generateActivity` function is used to generate a discord activity.
- Usage

  ```js
  const { generateActivity } = require('visa2discord');
  const customActivity = await generateActivity(client, channel, { custom: "814288819477020702" })
  const nameActivity = await generateActivity(client, channel, { name: "youtube" })
  console.log('Generated activity:', `discord.gg/${customActivity.code}`);
  console.log('Generated activity:', `discord.gg/${nameActivity.code}`);
  ```

- Here are the names that are supported:
  - `youtube` => Youtube Together
  - `poker` => Poker Night
  - `betrayal` => Betrayal.io
  - `fishing` => Fishington.io
  - `chess` => Chess in the Park
  - `checkers` => Checkers.
  - `doodlecrew` => Doodle Crew
  - `lettertile` => Letter Tile
  - `spellcast` => Spellcast
  - `wordsnacks` => Word Snacks
  - `watchtogether` => Watch Together
  - `ocho` => Ocho
  - `sketchheads` => Sketch Heads
  - `chessdev` => Chess in the Park (Dev)
  - `fishingdev` => Fishington.io (Dev)
  - `pokerdev` => Poker Night (Dev)
  - `letterleague` => Letter League
  - `watch` => Watch

## Disable Buttons
- The `disableButtons` function is used to disable all buttons in a message
- Usage
  ```js
  const { disableButtons } = require('visa2discord');
  const message = await channel.send({ content: 'This is a test message', components: [row] });
  message.edit({ components: disableButtons(message) });
  ```

## Transcripts
- The `transcripts` function is used to generate a transcript of a Discord channel
- <summary> Screenshots </summary>
  <details>
    Discord Channel
    <img src="https://cdn.discordapp.com/attachments/1111682190573588551/1122858433402654791/image.png" alt="Discord Channel" />
  </details>
  <details>
    Generated Transcript
    <img src="https://cdn.discordapp.com/attachments/1111682190573588551/1122858338338746498/image.png" alt="Generated Transcript" />
  </details>
- Supports 
  - [x] Discord flavored markdown
  - [x] Embeds
  - [ ] System Messages (Not Tested)
  - [ ] Slash Commands (Not Tested)
  - [x] Buttons
  - [x] Select Menus
  - [x] Reactions
  - [x] Attachments (ANY)
  - [x] Mentions
  - [ ] Pins (Not Tested)
  - [ ] Threads (Not Tested)
# Contributing

- If you want to contribute to this project, you can fork this repository and make a pull request.
- If you want to report a bug, you can create an issue.
- If you want to request a feature, you can create an issue.
- If you want to contact `visa2code#1747`, you can join my [discord server](https://discord.gg/e3CkRXy7HD).

# License

- This project is licensed under the [MIT License]()

# Credits

- [visa2code](https://github.com/TejasLamba2006) - Main Developer

# Support

- If you want to support me, you can star this repository and follow me on github.
- You can also join my [discord server](https://discord.gg/e3CkRXy7HD).

# Disclaimer

- This project is not affiliated with discord or any other company.
- This project is not responsible for any damage caused by this project.
- This project is not responsible for any damage caused by the usage of this project.
- This project is not responsible for any damage caused by the usage of the code provided in this project.
- This project is not responsible for any damage caused by the usage of the code provided in this repository.

# Changelogs

- [v1.0.17]
  - Minor Bug Fixes
- [v1.0.16]
  - Added `disableButtons` function: This function is used to disable all buttons in a message
  - Improved jsDocs
- [v1.0.15]
  - Added `generateActivity` function: This function is used to generate a discord activity
  - Fixed typo in `checkUdates.js`
  - Added jsDoc for each function

# End

- Thanks for reading this readme.md file.
- Have a nice day!
- Goodbye!

---
