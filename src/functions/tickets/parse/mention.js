class ParseMentionFlow {
  static REGEX_ROLES = /&lt;@&amp;([0-9]+)&gt;/;
  static REGEX_ROLES_2 = /<@&([0-9]+)>/;
  static REGEX_MEMBERS = /&lt;@!?([0-9]+)&gt;/;
  static REGEX_MEMBERS_2 = /<@!?([0-9]+)>/;
  static REGEX_CHANNELS = /&lt;#([0-9]+)&gt;/;
  static REGEX_CHANNELS_2 = /<#([0-9]+)>/;
  static REGEX_EMOJIS = /&lt;a?(:[^\n:]+:)[0-9]+&gt;/;
  static REGEX_EMOJIS_2 = /<a?(:[^\n:]+:)[0-9]+>/;
  static REGEX_TIME_HOLDER = [
    [/&lt;t:([0-9]+):t&gt;/, "%H:%M"],
    [/&lt;t:([0-9]+):T&gt;/, "%T"],
    [/&lt;t:([0-9]+):d&gt;/, "%d/%m/%Y"],
    [/&lt;t:([0-9]+):D&gt;/, "%e %B %Y"],
    [/&lt;t:([0-9]+):f&gt;/, "%e %B %Y %H:%M"],
    [/&lt;t:([0-9]+):F&gt;/, "%A, %e %B %Y %H:%M"],
    [/&lt;t:([0-9]+):R&gt;/, "%e %B %Y %H:%M"],
    [/&lt;t:([0-9]+)&gt;/, "%e %B %Y %H:%M"],
  ];

  static ESCAPE_LT = "______lt______";
  static ESCAPE_GT = "______gt______";
  static ESCAPE_AMP = "______amp______";

  constructor(content, guild) {
    this.content = content;
    this.guild = guild;
  }

  async flow() {
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

  escapeMentions() {
    const regex = new RegExp(
      `(${ParseMentionFlow.REGEX_ROLES}|${ParseMentionFlow.REGEX_MEMBERS}|${ParseMentionFlow.REGEX_CHANNELS}|${ParseMentionFlow.REGEX_EMOJIS}|${ParseMentionFlow.REGEX_ROLES_2}|${ParseMentionFlow.REGEX_MEMBERS_2}|${ParseMentionFlow.REGEX_CHANNELS_2}|${ParseMentionFlow.REGEX_EMOJIS_2})`,
      "g"
    );
    this.content = this.content.replace(regex, (match) => {
      return match
        .replace("<", ParseMentionFlow.ESCAPE_LT)
        .replace(">", ParseMentionFlow.ESCAPE_GT)
        .replace("&", ParseMentionFlow.ESCAPE_AMP);
    });
  }

  unescapeMentions() {
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

  channelMention() {
    const holder = [
      ParseMentionFlow.REGEX_CHANNELS,
      ParseMentionFlow.REGEX_CHANNELS_2,
    ];
    for (const regex of holder) {
      let match = this.content.match(regex);
      while (match) {
        const channelId = parseInt(match[1]);
        const channel = this.guild.channels.cache.get(channelId);

        const replacement = channel
          ? `<span class="mention" title="${channel.id}">#${channel.name}</span>`
          : "#deleted-channel";

        this.content = this.content.replace(match[0], replacement);
        match = this.content.match(regex);
      }
    }
  }

  roleMention() {
    const holder = [
      ParseMentionFlow.REGEX_ROLES,
      ParseMentionFlow.REGEX_ROLES_2,
    ];
    for (const regex of holder) {
      let match = this.content.match(regex);
      while (match) {
        const roleId = parseInt(match[1]);
        const role = this.guild.roles.cache.get(roleId);

        const replacement = role
          ? `<span style="color: ${role.color
              .toString(16)
              .padStart(6, "0")}">@${role.name}</span>`
          : "@deleted-role";

        this.content = this.content.replace(match[0], replacement);
        match = this.content.match(regex);
      }
    }
  }

  async memberMention() {
    const holder = [
      ParseMentionFlow.REGEX_MEMBERS,
      ParseMentionFlow.REGEX_MEMBERS_2,
    ];
    for (const regex of holder) {
      let match = this.content.match(regex);
      while (match) {
        const memberId = String(match[1]);
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

  timeMention() {
    const holder = ParseMentionFlow.REGEX_TIME_HOLDER;

    for (const [regex, strf] of holder) {
      let match = this.content.match(regex);
      while (match) {
        const timestamp = parseInt(match[1]) * 1000;
        const time = new Date(timestamp).toLocaleString(
          this.guild.preferredLocale,
          {
            timeZone: timezone,
          }
        );
        const uiTime = new Date(timestamp).toLocaleString(
          this.guild.preferredLocale,
          {
            timeZone: timezone,
            hour12: false,
            hour: "numeric",
            minute: "numeric",
          }
        );
        const tooltipTime = new Date(timestamp).toLocaleString(
          this.guild.preferredLocale,
          {
            timeZone: timezone,
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

module.exports = ParseMentionFlow;
