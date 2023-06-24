class ParseMention {
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
      [/&lt;t:([0-9]+)&gt;/, "%e %B %Y %H:%M"]
    ];
  
    static ESCAPE_LT = "______lt______";
    static ESCAPE_GT = "______gt______";
    static ESCAPE_AMP = "______amp______";
  
    constructor(content, guild) {
      this.content = content;
      this.guild = guild;
    }
  
    async flow() {
      await this.escapeMentions();
      await this.escapeMentions();
      await this.unescapeMentions();
      await this.channelMention();
      await this.memberMention();
      await this.roleMention();
      await this.timeMention();
  
      return this.content;
    }
  
    async escapeMentions() {
      const regex = new RegExp(
        `(${this.REGEX_ROLES}|${this.REGEX_MEMBERS}|${this.REGEX_CHANNELS}|${this.REGEX_EMOJIS}|${this.REGEX_ROLES_2}|${this.REGEX_MEMBERS_2}|${this.REGEX_CHANNELS_2}|${this.REGEX_EMOJIS_2})`,
        "g"
      );
      this.content = this.content.replace(regex, (match) => {
        return match
          .replace("<", this.ESCAPE_LT)
          .replace(">", this.ESCAPE_GT)
          .replace("&", this.ESCAPE_AMP);
      });
    }
  
    async unescapeMentions() {
      this.content = this.content.replace(new RegExp(this.ESCAPE_LT, "g"), "<");
      this.content = this.content.replace(new RegExp(this.ESCAPE_GT, "g"), ">");
      this.content = this.content.replace(new RegExp(this.ESCAPE_AMP, "g"), "&");
    }
  
    async channelMention() {
      const holder = [this.REGEX_CHANNELS, this.REGEX_CHANNELS_2];
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
  
    async roleMention() {
      const holder = [this.REGEX_ROLES, this.REGEX_ROLES_2];
      for (const regex of holder) {
        let match = this.content.match(regex);
        while (match) {
          const roleId = parseInt(match[1]);
          const role = this.guild.roles.cache.get(roleId);
  
          const replacement = role
            ? `<span style="color: ${role.color.toString(16).padStart(6, "0")}">@${role.name}</span>`
            : "@deleted-role";
  
          this.content = this.content.replace(match[0], replacement);
          match = this.content.match(regex);
        }
      }
    }
  
    async memberMention() {
      const holder = [this.REGEX_MEMBERS, this.REGEX_MEMBERS_2];
      for (const regex of holder) {
        let match = this.content.match(regex);
        while (match) {
          const memberId = parseInt(match[1]);
          const member = this.guild.members.cache.get(memberId);
  
          let replacement;
          if (member) {
            replacement = `<span class="mention" title="${memberId}">@${member.displayName}</span>`;
          } else {
            replacement = `<span class="mention" title="${memberId}">&lt;@${memberId}></span>`;
          }
  
          this.content = this.content.replace(match[0], replacement);
          match = this.content.match(regex);
        }
      }
    }
  
    async timeMention() {
      const holder = this.REGEX_TIME_HOLDER;
      const timezone = this.guild.timezone;
  
      for (const [regex, strf] of holder) {
        let match = this.content.match(regex);
        while (match) {
          const timestamp = parseInt(match[1]) * 1000;
          const time = new Date(timestamp).toLocaleString("en-US", {
            timeZone: timezone,
          });
          const uiTime = new Date(timestamp).toLocaleString("en-US", {
            timeZone: timezone,
            hour12: false,
            hour: "numeric",
            minute: "numeric",
          });
          const tooltipTime = new Date(timestamp).toLocaleString("en-US", {
            timeZone: timezone,
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          });
  
          const original = match[0].replace(/&lt;/g, "<").replace(/&gt;/g, ">");
          const replacement = `<span class="unix-timestamp" data-timestamp="${tooltipTime}" raw-content="${original}">${uiTime}</span>`;
  
          this.content = this.content.replace(match[0], replacement);
          match = this.content.match(regex);
        }
      }
    }
  }
  
  module.exports = ParseMention;