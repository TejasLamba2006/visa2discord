const html = require('html');
const { convertEmoji } = require('../ext/emoji_convert');

class ParseMarkdown {
  constructor(content) {
    this.content = content;
  }

  async standardMessageFlow() {
    this.httpsHttpLinks();
    this.parseNormalMarkdown();
    this.parseCodeBlockMarkdown();
    await this.parseEmoji();

    return this.content;
  }

  async linkEmbedFlow() {
    this.parseEmbedMarkdown();
    await this.parseEmoji();
  }

  async standardEmbedFlow() {
    this.httpsHttpLinks();
    this.parseEmbedMarkdown();
    this.parseNormalMarkdown();
    this.parseCodeBlockMarkdown();
    await this.parseEmoji();

    return this.content;
  }

  async specialEmbedFlow() {
    this.httpsHttpLinks();
    this.parseNormalMarkdown();
    this.parseCodeBlockMarkdown();
    await this.parseEmoji();

    return this.content;
  }

  async messageReferenceFlow() {
    this.httpsHttpLinks();
    this.parseNormalMarkdown();
    this.parseCodeBlockMarkdown({ reference: true });
    await this.parseEmoji();
    this.parseBr();

    return this.content;
  }

  async specialEmojiFlow() {
    await this.parseEmoji();
    return this.content;
  }

  parseBr() {
    this.content = this.content.replace(/<br>/g, " ");
  }

  async parseEmoji() {
    const holder = [
      [/<:.*?:(\d*)>/g, '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.png">'],
      [/<a:.*?:(\d*)>/g, '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.gif">'],
      [/&lt;:.*?:(\d*)&gt;/g, '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.png">'],
      [/&lt;a:.*?:(\d*)&gt;/g, '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.gif">'],
    ];

    this.content = await convertEmoji(this.content);

    for (const [p, r] of holder) {
      const pattern = new RegExp(p, "g");
      let match = pattern.exec(this.content);
      while (match) {
        const emojiId = match[1];
        this.content = this.content.replace(
          match[0],
          r.replace("%s", emojiId)
        );
        match = pattern.exec(this.content);
      }
    }
  }

  parseNormalMarkdown() {
    const holder = [
      [/__([^_]+)__/g, '<span style="text-decoration: underline">$1</span>'],
      [/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'],
      [/\*([^*]+)\*/g, '<em>$1</em>'],
      [/~~([^~]+)~~/g, '<span style="text-decoration: line-through">$1</span>'],
      [
        /\|\|([^\|]+)\|\|/g,
        '<span class="spoiler spoiler--hidden" onclick="showSpoiler(event, this)"> <span class="spoiler-text">$1</span></span>',
      ],
    ];

    for (const [p, r] of holder) {
      const pattern = new RegExp(p, "g");
      let match = pattern.exec(this.content);
      while (match) {
        const affectedText = match[1];
        this.content = this.content.replace(
          match[0],
          r.replace("%s", affectedText)
        );
        match = pattern.exec(this.content);
      }
    }
  }

  parseCodeBlockMarkdown(options = { reference: false }) {
    const holder = [
      [
        /```([a-zA-Z]+)?\n([\s\S]*?)\n```/g,
        (match) =>
          `<pre><code class="hljs ${
            match[1] ? `language-${match[1]}` : ""
          }">${html.escape(match[2])}</code></pre>`,
      ],
      [
        /`(.+?)`/g,
        (match) => `<code class="inline-code">${html.escape(match[1])}</code>`,
      ],
    ];

    for (const [p, r] of holder) {
      const pattern = new RegExp(p, "g");
      let match = pattern.exec(this.content);
      while (match) {
        const codeBlock = r(match);
        this.content = this.content.replace(match[0], codeBlock);
        match = pattern.exec(this.content);
      }
    }

    if (options.reference) {
      this.content = this.content.replace(
        />>> ?([\s\S]*?)\n?```/g,
        '<span class="spoiler spoiler--multiline" onclick="showSpoiler(event, this)"> <span class="spoiler-text">$1</span></span>'
      );
    }
  }

  httpsHttpLinks() {
    const pattern = new RegExp(
      /(?<!src=)(?<!href=)(?<!\!)(https?:\/\/[^\s/$.?#].[^\s]*)/gi
    );
    this.content = this.content.replace(
      pattern,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }
}
