import { Guild, TextChannel, Role } from "discord.js";

class ParseMentionFlow {
  static readonly REGEX_ROLES = /&lt;@&amp;(\d+)&gt;/;
  static readonly REGEX_ROLES_2 = /<@&(\d+)>/;
  static readonly REGEX_MEMBERS = /&lt;@!?(\d+)&gt;/;
  static readonly REGEX_MEMBERS_2 = /<@!?(\d+)>/;
  static readonly REGEX_CHANNELS = /&lt;#(\d+)&gt;/;
  static readonly REGEX_CHANNELS_2 = /<#(\d+)>/;
  static readonly REGEX_EMOJIS = /&lt;a?(:[^\n:]+:)\d+&gt;/;
  static readonly REGEX_EMOJIS_2 = /<a?(:[^\n:]+:)\d+>/;
  static readonly REGEX_TIME_HOLDER: [RegExp, string][] = [
    [/&lt;t:(\d+):t&gt;/, "%H:%M"],
    [/&lt;t:(\d+):T&gt;/, "%T"],
    [/&lt;t:(\d+):d&gt;/, "%d/%m/%Y"],
    [/&lt;t:(\d+):D&gt;/, "%e %B %Y"],
    [/&lt;t:(\d+):f&gt;/, "%e %B %Y %H:%M"],
    [/&lt;t:(\d+):F&gt;/, "%A, %e %B %Y %H:%M"],
    [/&lt;t:(\d+):R&gt;/, "%e %B %Y %H:%M"],
    [/&lt;t:(\d+)&gt;/, "%e %B %Y %H:%M"],
  ];

  static readonly ESCAPE_LT = "______lt______";
  static readonly ESCAPE_GT = "______gt______";
  static readonly ESCAPE_AMP = "______amp______";

  content: string;
  guild: Guild;

  constructor(content: string, guild: Guild) {
    this.content = content;
    this.guild = guild;
  }

  async flow(): Promise<string> {
    if (!this.content) return this.content;
    this.escapeMentions();
    this.escapeMentions();
    this.unescapeMentions();
    this.channelMention();
    await this.memberMention();
    this.roleMention();
    this.timeMention();

    return this.content;
  }

  escapeMentions(): void {
    const regex = new RegExp(
      `(${ParseMentionFlow.REGEX_ROLES.source}|${ParseMentionFlow.REGEX_MEMBERS.source}|${ParseMentionFlow.REGEX_CHANNELS.source}|${ParseMentionFlow.REGEX_EMOJIS.source}|${ParseMentionFlow.REGEX_ROLES_2.source}|${ParseMentionFlow.REGEX_MEMBERS_2.source}|${ParseMentionFlow.REGEX_CHANNELS_2.source}|${ParseMentionFlow.REGEX_EMOJIS_2.source})`,
      "g"
    );
    this.content = this.content.replace(regex, (match) => {
      return match
        .replace("<", ParseMentionFlow.ESCAPE_LT)
        .replace(">", ParseMentionFlow.ESCAPE_GT)
        .replace("&", ParseMentionFlow.ESCAPE_AMP);
    });
  }

  unescapeMentions(): void {
    this.content = this.content.replace(
      new RegExp(ParseMentionFlow.ESCAPE_LT, "g"),
      "<"
    );
    this.content = this.content.replace(
      new RegExp(ParseMentionFlow.ESCAPE_GT, "g"),
      ">"
    );
    this.content = this.content.replace(
      new RegExp(ParseMentionFlow.ESCAPE_AMP, "g"),
      "&"
    );
  }

  channelMention(): void {
    const holder = [
      ParseMentionFlow.REGEX_CHANNELS,
      ParseMentionFlow.REGEX_CHANNELS_2,
    ];
    for (const regex of holder) {
      let match = RegExp(regex).exec(this.content);
      while (match) {
        const channelId = match[1];
        const channel = this.guild.channels.cache.get(channelId) as TextChannel;

        const replacement = channel
          ? `<span class="mention" title="${channel.id}">#${channel.name}</span>`
          : "#deleted-channel";

        this.content = this.content.replace(match[0], replacement);
        match = RegExp(regex).exec(this.content);
      }
    }
  }

  roleMention(): void {
    const holder = [
      ParseMentionFlow.REGEX_ROLES,
      ParseMentionFlow.REGEX_ROLES_2,
    ];
    for (const regex of holder) {
      let match = this.content.match(regex);
      while (match) {
        const roleId = match[1];
        const role = this.guild.roles.cache.get(roleId) as Role;
        const replacement = role
          ? `<span class="mention" style="color: ${hexToRgba(
              role.hexColor
            )}; background-color:${hexToRgba(
              role.hexColor,
              0.1
            )};  transition: background-color 0.3s ease;" onmouseover="this.style.backgroundColor='${hexToRgba(
              role.hexColor,
              0.5
            )}'" onmouseout="this.style.backgroundColor='${hexToRgba(
              role.hexColor,
              0.1
            )}'">@${role.name}</span>`
          : "@deleted-role";

        this.content = this.content.replace(match[0], replacement);
        match = RegExp(regex).exec(this.content);
      }
    }
  }

  async memberMention(): Promise<void> {
    const holder = [
      ParseMentionFlow.REGEX_MEMBERS,
      ParseMentionFlow.REGEX_MEMBERS_2,
    ];
    for (const regex of holder) {
      let match = this.content.match(regex);
      while (match) {
        const memberId = match[1];
        const member = await this.guild.members.fetch(memberId);
        let replacement;
        if (member) {
          replacement = `<span class="mention" title="${memberId}">@${member.user.username}</span>`;
        } else {
          replacement = `<span class="mention" title="${memberId}">&lt;@${memberId}></span>`;
        }

        this.content = this.content.replace(match[0], replacement);
        match = this.content.match(regex);
      }
    }
  }

  timeMention(): void {
    const holder = ParseMentionFlow.REGEX_TIME_HOLDER;

    for (const [regex] of holder) {
      let match = this.content.match(regex);
      while (match) {
        const timestamp = parseInt(match[1]) * 1000;
        const uiTime = new Date(timestamp).toLocaleString(
          this.guild.preferredLocale,
          {
            timeZone: "UTC",
            hour12: false,
            hour: "numeric",
            minute: "numeric",
          }
        );
        const tooltipTime = new Date(timestamp).toLocaleString(
          this.guild.preferredLocale,
          {
            timeZone: "UTC",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          }
        );

        const original = match[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        const replacement = `<span class="unix-timestamp" data-timestamp="${tooltipTime}" raw-content="${original}">${uiTime}</span>`;

        this.content = this.content.replace(match[0], replacement);
        match = this.content.match(regex);
      }
    }
  }
}

export default ParseMentionFlow;

function hexToRgba(hexCode: string, alpha: number = 1.0): string {
  hexCode = hexCode.replace("#", "");

  const red = parseInt(hexCode.substring(0, 2), 16);
  const green = parseInt(hexCode.substring(2, 4), 16);
  const blue = parseInt(hexCode.substring(4, 6), 16);

  alpha = parseFloat(alpha.toString());

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
