import { convertEmoji } from "../ext/emojiConvert";

class ParseMarkdown {
  content: string;
  code_blocks_content: string[];

  constructor(content: string) {
    this.content = content;
    this.code_blocks_content = [];
  }

  async standardMessageFlow(): Promise<string> {
    this.parseCodeBlockMarkdown();
    this.httpsHttpLinks();
    this.parseNormalMarkdown();
    await this.parseEmoji();
    this.reverseCodeBlockMarkdown();

    return this.content;
  }

  async linkEmbedFlow(): Promise<string> {
    this.parseEmbedMarkdown();
    await this.parseEmoji();
    return this.content;
  }

  async standardEmbedFlow(): Promise<string> {
    this.parseCodeBlockMarkdown();
    this.httpsHttpLinks();
    this.parseEmbedMarkdown();
    this.parseNormalMarkdown();
    await this.parseEmoji();
    this.reverseCodeBlockMarkdown();

    return this.content;
  }

  async specialEmbedFlow(): Promise<string> {
    this.httpsHttpLinks();
    this.parseCodeBlockMarkdown();
    this.parseNormalMarkdown();
    await this.parseEmoji();
    this.reverseCodeBlockMarkdown();

    return this.content;
  }

  async messageReferenceFlow(): Promise<string> {
    this.httpsHttpLinks();
    this.parseCodeBlockMarkdown({ reference: true });
    this.parseNormalMarkdown();
    this.reverseCodeBlockMarkdown();
    await this.parseEmoji();
    this.parseBr();

    return this.content;
  }

  async specialEmojiFlow(): Promise<string> {
    await this.parseEmoji();
    return this.content;
  }

  parseBr(): void {
    this.content = this.content.replace(/<br>/g, " ");
  }

  async parseEmoji(): Promise<void> {
    const holder: [RegExp, string][] = [
      [
        /<:.*?:(\d*)>/g,
        '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.png">',
      ],
      [
        /<a:.*?:(\d*)>/g,
        '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.gif">',
      ],
      [
        /&lt;:.*?:(\d*)&gt;/g,
        '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.png">',
      ],
      [
        /&lt;a:.*?:(\d*)&gt;/g,
        '<img class="emoji emoji--small" src="https://cdn.discordapp.com/emojis/$1.gif">',
      ],
    ];

    this.content = await convertEmoji(this.content);

    for (const [p, r] of holder) {
      const pattern = new RegExp(p, "g");
      let match = pattern.exec(this.content);
      while (match) {
        const emojiId = match[1];
        this.content = this.content.replace(match[0], r.replace("$1", emojiId));
        match = pattern.exec(this.content);
      }
    }
  }

  parseNormalMarkdown(): void {
    this.orderListMarkdownToHtml();
    const holder: [RegExp, string][] = [
      [/__([^_]+)__/g, '<span style="text-decoration: underline">$1</span>'],
      [/\*\*([^*]+)\*\*/g, "<strong>$1</strong>"],
      [/\*([^*]+)\*/g, "<em>$1</em>"],
      [/~~([^~]+)~~/g, '<span style="text-decoration: line-through">$1</span>'],
      [
        /\|\|([^\|]+)\|\|/g,
        '<span class="spoiler spoiler--hidden" onclick="showSpoiler(event, this)"> <span class="spoiler-text">$1</span></span>',
      ],
      [/^###\s(.*?)\n/, "<h3>$1</h3>"],
      [/^##\s(.*?)\n/, "<h2>$1</h2>"],
      [/^#\s(.*?)\n/, "<h1>$1</h1>"],
    ];

    const codeRegex = /<code>(.*?)<\/code>/gs;
    const codeMatches = Array.from(
      this.content.matchAll(codeRegex),
      (match) => match[0]
    );
    const codePlaceholders = codeMatches.map(
      (code, index) => `__CODEBLOCK_${index}__`
    );
    let transformedContent = this.content;

    // Replace code blocks with placeholders
    for (let i = 0; i < codeMatches.length; i++) {
      transformedContent = transformedContent.replace(
        codeMatches[i],
        codePlaceholders[i]
      );
    }

    // Apply transformations outside code blocks
    for (const [p, r] of holder) {
      const pattern = new RegExp(p, "g");
      let match = pattern.exec(transformedContent);
      while (match) {
        const affectedText = match[1];
        transformedContent = transformedContent.replace(
          match[0],
          r.replace("$1", affectedText)
        );
        match = pattern.exec(transformedContent);
      }
    }

    // Restore code blocks from placeholders
    for (let i = 0; i < codePlaceholders.length; i++) {
      transformedContent = transformedContent.replace(
        codePlaceholders[i],
        codeMatches[i]
      );
    }

    this.content = transformedContent;
  }

  parseCodeBlockMarkdown(options: { reference?: boolean } = {}): void {
    const holder: [RegExp, (match: RegExpExecArray) => string][] = [
      [
        /```([a-zA-Z]+)?\n([\s\S]*?)```/g,
        (match) =>
          `<pre><code class="hljs ${match[1] ? `language-${match[1]}` : ""}">${
            match[2]
          }</code></pre>`,
      ],
      [
        /```\n?([\s\S]*?)\n?```/g,
        (match) => `<pre><code class="hljs">${match[1]}</code></pre>`,
      ],
      [
        /`([^`]+?)`/g,
        (match) => `<code class="inline-code">${match[1]}</code>`,
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

  parseEmbedMarkdown() {
    const pattern = /\[(.+?)]\((.+?)\)/g;
    let match = pattern.exec(this.content);
    while (match !== null) {
      const affectedText = match[1];
      const affectedUrl = match[2];
      this.content = this.content.replace(
        this.content.substring(match.index, match.index + match[0].length),
        `<a href="${affectedUrl}">${affectedText}</a>`
      );
      match = pattern.exec(this.content);
    }

    const lines = this.content.split("\n");
    let quoteBuffer: string | null = null;
    let newContent = "";
    const quotePattern = /^>\s(.+)/;

    if (lines.length === 1) {
      if (quotePattern.test(lines[0])) {
        this.content = `<div class="quote">${lines[0].substring(2)}</div>`;
        return this.content;
      }
      this.content = lines[0];
      return this.content;
    }

    for (const element of lines) {
      const line = element;
      if (quotePattern.test(line) && quoteBuffer) {
        quoteBuffer += "\n" + line.substring(2);
      } else if (!quoteBuffer) {
        if (quotePattern.test(line)) {
          quoteBuffer = line.substring(2);
        } else {
          newContent += line + "\n";
        }
      } else {
        newContent += `<div class="quote">${quoteBuffer}</div>`;
        newContent += line;
        quoteBuffer = "";
      }
    }

    if (quoteBuffer) {
      newContent += `<div class="quote">${quoteBuffer}</div>`;
    }

    this.content = newContent;
  }

  httpsHttpLinks(): void {
    const pattern = new RegExp(
      /(?<!src=)(?<!href=)(?<!\!)(https?:\/\/[^\s/$.?#].[^\s]*)/gi
    );
    this.content = this.content.replace(
      pattern,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
  }
  orderListMarkdownToHtml(): void {
    const lines = this.content.split("\n");
    let html = "";
    const indentStack: number[] = [0];
    let started = true;

    for (const line of lines) {
      const match = line.match(/^(\s*)([-*])\s+(.+)$/);
      if (match) {
        let [_, i, __, content] = match;
        const indent = i.length;

        if (started) {
          html +=
            '<ul class="markup" style="padding-left: 20px;margin: 0 !important">\n';
          started = false;
        }
        if (indent % 2 === 0) {
          while (indent < indentStack[indentStack.length - 1]) {
            html += "</ul>\n";
            indentStack.pop();
          }
          if (indent > indentStack[indentStack.length - 1]) {
            html += '<ul class="markup">\n';
            indentStack.push(indent);
          }
        } else {
          while (indent + 1 < indentStack[indentStack.length - 1]) {
            html += "</ul>\n";
            indentStack.pop();
          }
          if (indent + 1 > indentStack[indentStack.length - 1]) {
            html += '<ul class="markup">\n';
            indentStack.push(indent + 1);
          }
        }

        html += `<li class="markup">${content.trim()}</li>\n`;
      } else {
        while (indentStack.length > 1) {
          html += "</ul>";
          indentStack.pop();
        }
        if (!started) {
          html += "</ul>";
          started = true;
        }
        html += line + "\n";
      }
    }

    while (indentStack.length > 1) {
      html += "</ul>\n";
      indentStack.pop();
    }

    this.content = html;
  }
}

export default ParseMarkdown;
