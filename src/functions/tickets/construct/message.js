const Discord = require("discord.js");
const moment = require("moment-timezone");
const { DiscordUtils } = require("../ext/discord_utils");
const { Attachment } = require("./assets/attachment");
const { Embed } = require("./assets/embed");
const { Reaction } = require("./assets/reaction");
const { Component } = require("./assets/components");
const {
  bot_tag,
  bot_tag_verified,
  message_body,
  message_pin,
  message_thread,
  message_content,
  message_reference,
  message_reference_unknown,
  message_interaction,
  img_attachment,
  start_message,
  end_message,
  PARSE_MODE_NONE,
  PARSE_MODE_MARKDOWN,
  PARSE_MODE_REFERENCE,
  fillOut,
} = require("../ext/html_gen.js");
const cache = require("../ext/cache");

class MessageConstruct {
  message_html = "";
  embeds = "";
  reactions = "";
  components = "";
  attachments = "";
  time_format = "";

  constructor(
    message,
    previous_message,
    pytz_timezone,
    military_time,
    guild,
    meta_data
  ) {
    this.message = message[1] || message;
    this.previous_message = previous_message;
    this.pytz_timezone = pytz_timezone;
    this.military_time = military_time;
    this.guild = guild;
    this.time_format = "%A, %e %B %Y %I:%M %p";
    if (this.military_time) {
      this.time_format = "%A, %e %B %Y %H:%M";
    }

    const [message_created_at, message_edited_at] = this.set_time();
    this.message_created_at = message_created_at;
    this.message_edited_at = message_edited_at;
    this.meta_data = meta_data;
  }

  async construct_message() {
    if (Discord.MessageType.ChannelPinnedMessage === this.message?.type) {
      await this.build_pin();
    } else if (this.message?.thread) {
      await this.build_message();
      await this.build_thread();
    } else {
      await this.build_message();
    }
    return [this.message_html, this.meta_data];
  }

  async build_message() {
    await this.build_content();
    await this.build_reference();
    await this.build_interaction();
    await this.build_sticker();
    await this.build_assets();
    await this.build_message_template();
    await this.build_meta_data();
  }

  _generate_message_divider_check() {
    return (
      !this.previous_message ||
      this.message.reference !== "" ||
      this.message.interaction !== "" ||
      this.previous_message.author?.id !== this.message.author.id ||
      this.message.webhookId !== null ||
      this.message.createdTimestamp >
      this.previous_message.createdTimestamp + 4 * 60 * 1000
    );
  }
  async generate_message_divider(channel_audit = false) {
    if (channel_audit || this._generate_message_divider_check()) {
      if (this.previous_message !== null) {
        this.message_html += await fillOut(this.guild, end_message, []);
      }

      if (channel_audit) {
        return;
      }
      let followup_symbol = "";
      const is_bot = _gather_user_bot(message.author);
      const avatar_url =
        this.message.author.displayAvatarURL() || DiscordUtils.default_avatar;

      if (this.message.reference || this.message.interaction) {
        followup_symbol = "<div class='chatlog__followup-symbol'></div>";
      }

      let time = this.message.createdAt;
      if (!this.message.createdAt) {
        time = timezone("UTC").localize(time);
      }

      const default_timestamp = time.toLocaleString(this.pytz_timezone);

      this.message_html += await fillOut(this.guild, start_message, [
        [
          "REFERENCE_SYMBOL",
          this.message.interaction ? followup_symbol : "",
          PARSE_MODE_NONE,
        ],
        ["REFERENCE", this.message.interaction || "", PARSE_MODE_NONE],
        ["AVATAR_URL", String(avatar_url), PARSE_MODE_NONE],
        [
          "NAME_TAG",
          `${this.message.author.username}`,
          PARSE_MODE_NONE,
        ],
        ["USER_ID", String(this.message.author.id)],
        ["USER_COLOUR", await this._gather_user_colour(this.message.author)],
        [
          "USER_ICON",
          await this._gather_user_icon(this.message.author),
          PARSE_MODE_NONE,
        ],
        ["NAME", String(escapeHtml(this.message.author.displayName))],
        ["BOT_TAG", String(is_bot), PARSE_MODE_NONE],
        ["TIMESTAMP", String(this.message.createdTimestamp)],
        ["DEFAULT_TIMESTAMP", String(default_timestamp), PARSE_MODE_NONE],
        ["MESSAGE_ID", this.message.id],
        ["MESSAGE_CONTENT", this.message.content, PARSE_MODE_MARKDOWN],
        ["EMBEDS", this.embeds, PARSE_MODE_NONE],
        ["ATTACHMENTS", this.attachments, PARSE_MODE_NONE],
        ["COMPONENTS", this.components, PARSE_MODE_NONE],
        ["EMOJI", this.reactions, PARSE_MODE_NONE],
      ]);

      return true;
    }
  }
  async build_message_template() {
    async function generate_message_divider(channel_audit = false, xd) {
      if (channel_audit || xd._generate_message_divider_check()) {
        if (xd.previous_message !== null) {
          xd.message_html += await fillOut(xd.guild, end_message, []);
        }

        if (channel_audit) {
          return;
        }
        let followup_symbol = "";
        const is_bot = xd._gather_user_bot(xd.message.author);
        const avatar_url =
          xd.message.author.displayAvatarURL() || DiscordUtils.default_avatar;

        if (xd.message.reference || xd.message.interaction) {
          followup_symbol = "<div class='chatlog__followup-symbol'></div>";
        }

        let time = xd.message.createdAt;
        if (!xd.message.createdAt) {
          time = timezone("UTC").localize(time);
        }
        const default_timestamp = time.toLocaleString(xd.pytz_timezone);
        xd.message_html += await fillOut(xd.guild, start_message, [
          [
            "REFERENCE_SYMBOL",
            xd.message.reference || xd.message.interaction ? followup_symbol : "",
            PARSE_MODE_NONE,
          ],
          ["REFERENCE", xd.message.reference || xd.message.interaction || "", PARSE_MODE_NONE],
          ["AVATAR_URL", String(avatar_url), PARSE_MODE_NONE],
          [
            "NAME_TAG",
            `${xd.message.author.username}`,
            PARSE_MODE_NONE,
          ],
          ["USER_ID", String(xd.message.author.id)],
          ["USER_COLOUR", await xd._gather_user_colour(xd.message.author)],
          [
            "USER_ICON",
            await xd._gather_user_icon(xd.message.author),
            PARSE_MODE_NONE,
          ],
          ["NAME", String(escapeHtml(xd.message.author.username))],
          ["BOT_TAG", String(is_bot), PARSE_MODE_NONE],
          ["TIMESTAMP", String(xd.message.createdTimestamp)],
          ["DEFAULT_TIMESTAMP", String(default_timestamp), PARSE_MODE_NONE],
          ["MESSAGE_ID", xd.message.id],
          ["MESSAGE_CONTENT", xd.message.content, PARSE_MODE_MARKDOWN],
          ["EMBEDS", xd.embeds, PARSE_MODE_NONE],
          ["ATTACHMENTS", xd.attachments, PARSE_MODE_NONE],
          ["COMPONENTS", xd.components, PARSE_MODE_NONE],
          ["EMOJI", xd.reactions, PARSE_MODE_NONE],
        ]);
        return true;
      }
    }
    const started = await generate_message_divider(false, this);
    if (started) {
      return this.message_html;
    }
    this.message_html += await fillOut(guild, message_body, [
      ["MESSAGE_ID", this.message.id],
      ["MESSAGE_CONTENT", this.message.content, PARSE_MODE_MARKDOWN],
      ["EMBEDS", this.embeds, PARSE_MODE_NONE],
      ["ATTACHMENTS", this.attachments, PARSE_MODE_NONE],
      ["COMPONENTS", this.components, PARSE_MODE_NONE],
      ["EMOJI", this.reactions, PARSE_MODE_NONE],
      ["TIMESTAMP", this.message.createdAt, PARSE_MODE_NONE],
      ["TIME", this.message.createdAt.split(" ").pop(), PARSE_MODE_NONE],
    ]);

    return this.message_html;
  }

  async build_pin() {
    await this.generate_message_divider(true);
    await this.build_pin_template();
  }
  async _gather_user_colour(author) {
    const member = await this._gather_member(author);
    const user_colour =
      member && member.displayHexColor !== "#000000"
        ? member.displayHexColor
        : "#FFFFFF";
    return `color: ${user_colour};`;
  }
  async _gather_member(author) {
    let member = this.guild.members.cache.get(author.id);

    if (member) {
      return member;
    }

    try {
      member = await this.guild.members.fetch(author.id);
      return member;
    } catch (error) {
      return null;
    }
  }

  async build_pin_template() {
    this.message_html += await fillOut(this.guild, message_pin, [
      ["PIN_URL", DiscordUtils.pinned_message_icon, PARSE_MODE_NONE],
      ["USER_COLOUR", await this._gather_user_colour(this.message.author)],
      ["NAME", String(escapeHtml(this.message.author.username))],
      [
        "NAME_TAG",
        `${this.message.author.username}`,
        PARSE_MODE_NONE,
      ],
      ["MESSAGE_ID", this.message.id, PARSE_MODE_NONE],
      [
        "REF_MESSAGE_ID",
        String(this.message.reference.messageId),
        PARSE_MODE_NONE,
      ],
    ]);
  }
  async build_thread_template() {
    this.messageHtml += await fillOut(this.guild, message_thread, [
      ["THREAD_URL", DiscordUtils.thread_channel_icon, PARSE_MODE_NONE],
      ["THREAD_NAME", this.message.thread.name, PARSE_MODE_NONE],
      ["USER_COLOUR", await this._gather_user_colour(this.message.author)],
      ["NAME", escapeHtml(this.message.author.username).toString()],
      ["NAME_TAG", `${this.message.author.username}`, PARSE_MODE_NONE],
      ["MESSAGE_ID", this.message.id.toString(), PARSE_MODE_NONE]
    ]);
  }

  async build_thread() {
    await this.generate_message_divider(true);
    await this.build_thread_template();
  }
  async _gather_user_icon(author) {
    const member = await this._gather_member(author);

    if (!member) {
      return "";
    }
    if (member.roles.highest.icon && member.roles.highest.iconURL()) {
      return `<img class='chatlog__role-icon' src='${member.roles.highest.iconURL()}' alt='Role Icon'>`;
    }

    return "";
  }

  async generate_message_divider(channel_audit = false) {
    if (channel_audit || this._generate_message_divider_check()) {
      if (this.previous_message !== null) {
        this.message_html += await fillOut(this.guild, end_message, []);
      }

      if (channel_audit) {
        return;
      }

      let followup_symbol = "";
      const is_bot = this._gather_user_bot(this.message.author);
      const avatar_url =
        this.message.author.displayAvatarURL() || DiscordUtils.default_avatar;

      if (this.message.reference !== "" || this.message.interaction) {
        followup_symbol = "<div class='chatlog__followup-symbol'></div>";
      }

      let time = this.message.createdAt;
      if (!this.message.createdAt) {
        time = moment.tz(time, "UTC");
      }

      const default_timestamp = time.toLocaleString(this.pytz_timezone);

      this.message_html += await fillOut(this.guild, start_message, [
        ["REFERENCE_SYMBOL", this.message.reference || this.message.interaction ? followup_symbol : "", PARSE_MODE_NONE],
        [
          "REFERENCE",
          this.message.reference || this.message.interaction || "",
          PARSE_MODE_NONE,
        ],
        ["AVATAR_URL", String(avatar_url), PARSE_MODE_NONE],
        [
          "NAME_TAG",
          `${this.message.author.username}`,
          PARSE_MODE_NONE,
        ],
        ["USER_ID", String(this.message.author.id)],
        ["USER_COLOUR", await this._gather_user_colour(this.message.author)],
        [
          "USER_ICON",
          await this._gather_user_icon(this.message.author),
          PARSE_MODE_NONE,
        ],
        ["NAME", String(escapeHtml(this.message.author.username))],
        ["BOT_TAG", String(is_bot), PARSE_MODE_NONE],
        ["TIMESTAMP", String(this.message_created_at)],
        ["DEFAULT_TIMESTAMP", String(default_timestamp), PARSE_MODE_NONE],
        ["MESSAGE_ID", this.message.id],
        ["MESSAGE_CONTENT", this.message.content, PARSE_MODE_MARKDOWN],
        ["EMBEDS", this.embeds, PARSE_MODE_NONE],
        ["ATTACHMENTS", this.attachments, PARSE_MODE_NONE],
        ["COMPONENTS", this.components, PARSE_MODE_NONE],
        ["EMOJI", this.reactions, PARSE_MODE_NONE],
      ]);

      return true;
    }
  }

  _gather_user_bot(author) {
    if (author.bot && author.flags.has(Discord.UserFlags.VerifiedBot)) {
      return bot_tag_verified;
    } else if (author.bot) {
      return bot_tag;
    }
    return "";
  }

  async build_meta_data() {
    const user_id = this.message.author.id;

    if (user_id in this.meta_data) {
      this.meta_data[user_id][4] += 1;
    } else {
      const user_name = `${this.message.author.username}`;
      const user_created_at = this.message.author.createdAt;
      const user_bot = this._gather_user_bot(this.message.author);
      const user_avatar =
        this.message.author.displayAvatarURL() || DiscordUtils.default_avatar;
      const user_joined_at = this.message.author.joinedAt || null;
      const user_display_name =
        this.message.author.display_name !== this.message.author.username
          ? `<div class="meta__display-name">${this.message.author.username}</div>`
          : "";
      this.meta_data[user_id] = [
        user_name,
        user_created_at,
        user_bot,
        user_avatar,
        1,
        user_joined_at,
        user_display_name,
      ];
    }
  }

  async build_content() {
    if (!this.message?.content) {
      this.message.content = "";
    }

    // if (this.message.editedTimestamp) {
    //   const formatted_edited_at = this.message?.editedTimestamp.toLocaleString(
    //     this.pytz_timezone
    //   );

    //   const edited_indicator = this.message.editedTimestamp
    //     ? `<span class="edited-indicator"> (edited: ${formatted_edited_at})</span>`
    //     : "";

    //   this.message_html += `<div class="message__content">${this.message.content}${edited_indicator}</div>`;
    // }
  }

  setEditAt(messageEditedAt) {
    return `<span class="chatlog__reference-edited-timestamp" title="${messageEditedAt}">(edited)</span>`;
  }


  async build_reference() {
    if (!this.message.reference) {
      this.message.reference = "";
      return;
    }
    let message
    try {
      message = await this.message.channel.messages.fetch(this.message.reference.messageId);
    } catch (error) {
      this.message.reference = "";
      if (error.code === 10008) {
        this.message.reference = message_reference_unknown;
      }
      return;
    }

    const isBot = this._gather_user_bot(message.author);
    const userColour = await this._gather_user_colour(message.author);

    if (!message.content && !message.interaction && message.attachments && message.attachments.size > 0 && message.embeds.length === 0) {
      message.content = "Click to see attachment";
    } else if (!message.content && message.interaction) {
      message.content = "Click to see command";
    } else if (!message.content && message.embeds.length > 0) {
      message.content = "Click to see embed";
    } else if (!message.content) {
      message.content = "Click to see message";
    }

    let icon = DiscordUtils.button_external_link;
    if (!message.interaction && (message.embeds.length > 0 || message.attachments.size > 0)) {
      icon = DiscordUtils.reference_attachment_icon;
    } else if (message.interaction) {
      icon = DiscordUtils.interaction_command_icon;
    }

    let [_, messageEditedAt] = this.set_time(message);

    if (messageEditedAt) {
      messageEditedAt = this.setEditAt(messageEditedAt);
    }

    const avatarUrl = message.author.displayAvatarURL() || DiscordUtils.default_avatar;
    this.message.reference = await fillOut(this.guild, message_reference, [
      ["AVATAR_URL", String(avatarUrl), PARSE_MODE_NONE],
      ["BOT_TAG", isBot, PARSE_MODE_NONE],
      ["NAME_TAG", `${message.author.username}`, PARSE_MODE_NONE],
      ["NAME", String(escapeHtml(message.author.username))],
      ["USER_COLOUR", userColour, PARSE_MODE_NONE],
      ["CONTENT", message.content, PARSE_MODE_REFERENCE],
      ["EDIT", messageEditedAt, PARSE_MODE_NONE],
      ["ICON", icon, PARSE_MODE_NONE],
      ["USER_ID", String(message.author.id), PARSE_MODE_NONE],
      ["MESSAGE_ID", String(this.message.reference.messageId), PARSE_MODE_NONE],
    ]);
  }

  async build_interaction() {
    if (!this.message.interaction) {
      this.message.interaction = "";
      return;
    }

    const user = this.message.interaction.user;
    const isBot = this._gather_user_bot(user);
    const userColour = await this._gather_user_colour(user);
    const avatarUrl = user.displayAvatarURL() || DiscordUtils.defaultAvatar;
    this.message.interaction = await fillOut(this.guild, message_interaction, [
      ["AVATAR_URL", avatarUrl, PARSE_MODE_NONE],
      ["BOT_TAG", isBot, PARSE_MODE_NONE],
      ["NAME_TAG", `${user.username}`, PARSE_MODE_NONE],
      ["NAME", escapeHtml(user.username), PARSE_MODE_NONE],
      ["USER_COLOUR", userColour, PARSE_MODE_NONE],
      ["FILLER", "used ", PARSE_MODE_NONE],
      ["COMMAND", `/${this.message.interaction.commandName}`, PARSE_MODE_NONE],
      ["USER_ID", user.id, PARSE_MODE_NONE],
      ["INTERACTION_ID", this.message.interaction.id, PARSE_MODE_NONE],
    ]);
  }


  async build_sticker() {
    if (this.message.stickers.size === 0) {
      return;
    }

    let stickerImageUrl = this.message.stickers.first().url;

    if (stickerImageUrl.endsWith(".json")) {
      const sticker = await this.message.stickers.first().fetch();
      stickerImageUrl = `https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/stickers/${sticker.packId}/${sticker.id}.gif`;
    }

    this.attachments = await fillOut(this.guild, img_attachment, [
      ["ATTACH_URL", stickerImageUrl, PARSE_MODE_NONE],
      ["ATTACH_URL_THUMB", stickerImageUrl, PARSE_MODE_NONE]
    ]);
  }


  async build_assets() {
    await this.build_attachments();
    await this.build_embeds();
    await this.build_components();
    await this.build_reactions();
  }

  async build_attachments() {
    if (this.message.attachments.size > 0) {
      for (const attachment of this.message.attachments.values()) {
        this.attachments += await new Attachment(attachment).flow();
      }
    }
  }

  async build_embeds() {
    if (this.message.embeds.length > 0) {
      for (const embed of this.message.embeds) {
        this.embeds += await new Embed(embed, this.guild).flow();
      }
    }
  }

  async build_reactions() {
    if (this.message.reactions.cache.size > 0) {
      for (const reaction of this.message.reactions.cache.values()) {
        this.reactions += await new Reaction(reaction, this.guild).flow();
      }
    }
  }

  set_time(message = null) {
    message = message || this.message;

    const created_at_str = this.to_local_time_str(message?.createdAt);
    const edited_at_str = message?.editedAt
      ? this.to_local_time_str(message?.editedAt)
      : "";

    return [created_at_str, edited_at_str];
  }
  to_local_time_str(time) {
    if (!this.message?.createdAt) {
      time = moment.tz(time, "UTC");
    }

    const local_time = time.toLocaleString(this.pytz_timezone);

    if (this.military_time) {
      return local_time.toLocaleString(this.time_format);
    }

    return local_time.toLocaleString(this.time_format);
  }

  async build_components() {
    if (this.message.components.length > 0) {
      for (const component of this.message.components) {
        const componentInstance = new Component(
          this.message.components,
          this.guild
        );
        this.components += await componentInstance.flow();
      }
    }
  }
}

// Function to convert the message object to HTML
async function convertMessageToHTML(
  message,
  previousMessage,
  pytz_timezone,
  military_time,
  guild,
  meta_data
) {
  const messageConstruct = new MessageConstruct(
    message,
    previousMessage,
    pytz_timezone,
    military_time,
    guild,
    meta_data
  );
  const [message_html, updated_meta_data] =
    await messageConstruct.construct_message();
  return { message_html, updated_meta_data };
}

async function gatherMessages(messages, guild, pytz_timezone, military_time) {
  let message_html = "";
  let meta_data = {};
  let previous_message = null;
  for (const message of messages) {
    const messageConstruct = new MessageConstruct(
      message,
      previous_message,
      pytz_timezone,
      military_time,
      guild,
      meta_data
    );

    const [content_html, updated_meta_data] =
      await messageConstruct.construct_message();

    message_html += content_html;
    previous_message = message;
    meta_data = updated_meta_data;
  }

  message_html += "</div>";
  return [message_html, meta_data];
}
module.exports = {
  convertMessageToHTML,
  MessageConstruct,
  gatherMessages,
};

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
