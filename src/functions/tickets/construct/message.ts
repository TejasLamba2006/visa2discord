import {
  Collection,
  Guild,
  GuildMember,
  Message,
  MessageType,
  User,
  UserFlags,
} from "discord.js";
import moment from "moment-timezone";
import { DiscordUtils } from "../ext/discordUtils.js";
import Attachment from "./assets/attachment.js";
import Embed from "./assets/embed.js";
import Reaction from "./assets/reaction.js";
import Component from "./assets/components.js";
import {
  bot_tag,
  bot_tag_verified,
  message_body,
  message_pin,
  message_thread,
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
} from "../ext/htmlGen.js";
//import cache from "../ext/cache.js";

type MetaData = {
  [key: string]: [string, Date, string, string, number, Date | null, string];
};

class MessageConstruct {
  message_html = "";
  embeds = "";
  reactions = "";
  components = "";
  attachments = "";
  time_format = "";
  reference = "";
  interaction = "";

  message: Message;
  previous_message: Message | null;
  pytz_timezone: string;
  military_time: boolean;
  guild: Guild;
  meta_data: MetaData;
  message_created_at: string;
  message_edited_at: string;

  constructor(
    message: Message,
    previous_message: Message | null,
    pytz_timezone: string,
    military_time: boolean,
    guild: Guild,
    meta_data: MetaData
  ) {
    this.message = message;
    this.previous_message = previous_message;
    this.pytz_timezone = pytz_timezone;
    this.military_time = military_time;
    this.guild = guild;
    this.time_format = military_time
      ? "%A, %e %B %Y %H:%M"
      : "%A, %e %B %Y %I:%M %p";

    const [message_created_at, message_edited_at] = this.set_time();
    this.message_created_at = message_created_at;
    this.message_edited_at = message_edited_at;
    this.meta_data = meta_data;
  }

  async construct_message(): Promise<[string, MetaData]> {
    if (this.message.type === MessageType.ChannelPinnedMessage) {
      await this.build_pin();
    } else if (this.message.thread) {
      await this.build_message();
      await this.build_thread();
    } else {
      await this.build_message();
    }
    return [this.message_html, this.meta_data];
  }

  async build_message(): Promise<void> {
    await this.build_content();
    await this.build_reference();
    await this.build_interaction();
    await this.build_sticker();
    await this.build_assets();
    await this.build_message_template();
    await this.build_meta_data();
  }

  _generate_message_divider_check(): boolean {
    return (
      !this.previous_message ||
      this.message.reference !== null ||
      this.message.interaction !== null ||
      this.previous_message.author?.id !== this.message.author.id ||
      this.message.webhookId !== null ||
      this.message.createdTimestamp >
        (this.previous_message?.createdTimestamp || 0) + 4 * 60 * 1000
    );
  }

  async generate_message_divider(channel_audit = false): Promise<boolean> {
    if (channel_audit || this._generate_message_divider_check()) {
      if (this.previous_message !== null) {
        this.message_html += await fillOut(this.guild, end_message, []);
      }

      if (channel_audit) {
        return false;
      }
      const followup_symbol =
        this.message.reference || this.message.interaction
          ? "<div class='chatlog__followup-symbol'></div>"
          : "";
      const is_bot = this._gather_user_bot(this.message.author);
      const avatar_url =
        this.message.author.displayAvatarURL() || DiscordUtils.default_avatar;

      const time = this.message.createdAt;
      const default_timestamp = time.toLocaleString(this.pytz_timezone);

      this.message_html += await fillOut(this.guild, start_message, [
        [
          "REFERENCE_SYMBOL",
          this.message.interaction ? followup_symbol : "",
          PARSE_MODE_NONE,
        ],
        [
          "REFERENCE",
          this.message.interactionMetadata?.originalResponseMessageId ?? "",
          PARSE_MODE_NONE,
        ],
        ["AVATAR_URL", String(avatar_url), PARSE_MODE_NONE],
        ["NAME_TAG", `${this.message.author.username}`, PARSE_MODE_NONE],
        ["USER_ID", String(this.message.author.id), PARSE_MODE_MARKDOWN],
        [
          "USER_COLOUR",
          await this._gather_user_colour(this.message.author),
          PARSE_MODE_MARKDOWN,
        ],
        [
          "USER_ICON",
          await this._gather_user_icon(this.message.author),
          PARSE_MODE_NONE,
        ],
        [
          "NAME",
          String(escapeHtml(this.message.author.displayName)),
          PARSE_MODE_MARKDOWN,
        ],
        ["BOT_TAG", String(is_bot), PARSE_MODE_NONE],
        [
          "TIMESTAMP",
          String(this.message.createdTimestamp),
          PARSE_MODE_MARKDOWN,
        ],
        ["DEFAULT_TIMESTAMP", String(default_timestamp), PARSE_MODE_NONE],
        ["MESSAGE_ID", this.message.id, PARSE_MODE_MARKDOWN],
        ["MESSAGE_CONTENT", this.message.content, PARSE_MODE_MARKDOWN],
        ["EMBEDS", this.embeds, PARSE_MODE_NONE],
        ["ATTACHMENTS", this.attachments, PARSE_MODE_NONE],
        ["COMPONENTS", this.components, PARSE_MODE_NONE],
        ["EMOJI", this.reactions, PARSE_MODE_NONE],
      ]);

      return true;
    }
    return false;
  }

  async build_message_template(): Promise<void> {
    const started = await this.generate_message_divider(false);
    if (started) {
      return;
    }
    this.message_html += await fillOut(this.guild, message_body, [
      ["MESSAGE_ID", this.message.id, PARSE_MODE_MARKDOWN],
      ["MESSAGE_CONTENT", this.message.content, PARSE_MODE_MARKDOWN],
      ["EMBEDS", this.embeds, PARSE_MODE_NONE],
      ["ATTACHMENTS", this.attachments, PARSE_MODE_NONE],
      ["COMPONENTS", this.components, PARSE_MODE_NONE],
      ["EMOJI", this.reactions, PARSE_MODE_NONE],
      ["TIMESTAMP", this.message.createdAt.toISOString(), PARSE_MODE_NONE],
      [
        "TIME",
        this.message.createdAt.toLocaleString().split(" ").pop()!,
        PARSE_MODE_NONE,
      ],
    ]);
  }

  async build_pin(): Promise<void> {
    await this.generate_message_divider(true);
    await this.build_pin_template();
  }

  async _gather_user_colour(author: User): Promise<string> {
    const member = await this._gather_member(author);
    const user_colour =
      member && member.displayHexColor !== "#000000"
        ? member.displayHexColor
        : "#FFFFFF";
    return `color: ${user_colour};`;
  }

  async _gather_member(author: User): Promise<GuildMember | null> {
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

  async build_pin_template(): Promise<void> {
    this.message_html += await fillOut(this.guild, message_pin, [
      ["PIN_URL", DiscordUtils.pinned_message_icon, PARSE_MODE_NONE],
      [
        "USER_COLOUR",
        await this._gather_user_colour(this.message.author),
        PARSE_MODE_MARKDOWN,
      ],
      [
        "NAME",
        String(escapeHtml(this.message.author.username)),
        PARSE_MODE_MARKDOWN,
      ],
      ["NAME_TAG", `${this.message.author.username}`, PARSE_MODE_NONE],
      ["MESSAGE_ID", this.message.id, PARSE_MODE_NONE],
      [
        "REF_MESSAGE_ID",
        String(this.message.reference?.messageId),
        PARSE_MODE_NONE,
      ],
    ]);
  }

  async build_thread_template(): Promise<void> {
    this.message_html += await fillOut(this.guild, message_thread, [
      ["THREAD_URL", DiscordUtils.thread_channel_icon, PARSE_MODE_NONE],
      ["THREAD_NAME", this.message.thread?.name ?? "", PARSE_MODE_NONE],
      [
        "USER_COLOUR",
        await this._gather_user_colour(this.message.author),
        PARSE_MODE_MARKDOWN,
      ],
      [
        "NAME",
        escapeHtml(this.message.author.username).toString(),
        PARSE_MODE_MARKDOWN,
      ],
      ["NAME_TAG", `${this.message.author.username}`, PARSE_MODE_NONE],
      ["MESSAGE_ID", this.message.id.toString(), PARSE_MODE_NONE],
    ]);
  }

  async build_thread(): Promise<void> {
    await this.generate_message_divider(true);
    await this.build_thread_template();
  }

  async _gather_user_icon(author: User): Promise<string> {
    const member = await this._gather_member(author);

    if (!member) {
      return "";
    }
    if (member.roles.highest.icon && member.roles.highest.iconURL()) {
      return `<img class='chatlog__role-icon' src='${member.roles.highest.iconURL()}' alt='Role Icon'>`;
    }

    return "";
  }

  _gather_user_bot(author: User): string {
    if (author.bot && author.flags?.has(UserFlags.VerifiedBot)) {
      return bot_tag_verified;
    } else if (author.bot) {
      return bot_tag;
    }
    return "";
  }

  async build_meta_data(): Promise<void> {
    const user_id = this.message.author.id;

    if (user_id in this.meta_data) {
      this.meta_data[user_id][4] += 1;
    } else {
      const user_name = `${this.message.author.username}`;
      const user_created_at = this.message.author.createdAt;
      const user_bot = this._gather_user_bot(this.message.author);
      const user_avatar =
        this.message.author.displayAvatarURL() || DiscordUtils.default_avatar;
      const user_joined_at =
        this.guild.members.cache.get(this.message.author.id)?.joinedAt || null;
      const user_display_name =
        this.message.author.displayName !== this.message.author.username
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

  async build_content(): Promise<void> {
    if (!this.message?.content) {
      this.message.content = "";
    }

    if (this.message.editedTimestamp) {
      const formatted_edited_at = this.to_local_time_str(
        this.message.editedTimestamp
      );

      const edited_indicator = this.message.editedTimestamp
        ? `<span class="edited-indicator"> (edited: ${formatted_edited_at})</span>`
        : "";

      this.message_html += `<div class="message__content">${this.message.content}${edited_indicator}</div>`;
    }
  }

  setEditAt(messageEditedAt: string): string {
    return `<span class="chatlog__reference-edited-timestamp" title="${messageEditedAt}">(edited)</span>`;
  }

  async build_reference(): Promise<void> {
    if (!this.message.reference?.messageId) {
      this.reference = "";
      return;
    }
    let message;
    try {
      message = await this.message.channel.messages.fetch(
        this.message.reference.messageId
      );
    } catch (error: any) {
      this.reference = "";
      if (error.code === 10008) {
        this.reference = message_reference_unknown;
      }
      return;
    }

    const isBot = this._gather_user_bot(message.author);
    const userColour = await this._gather_user_colour(message.author);

    if (
      !message.content &&
      !message.interaction &&
      message.attachments.size > 0 &&
      message.embeds.length === 0
    ) {
      message.content = "Click to see attachment";
    } else if (!message.content && message.interaction) {
      message.content = "Click to see command";
    } else if (!message.content && message.embeds.length > 0) {
      message.content = "Click to see embed";
    } else if (!message.content) {
      message.content = "Click to see message";
    }

    let icon = DiscordUtils.button_external_link;
    if (
      !message.interaction &&
      (message.embeds.length > 0 || message.attachments.size > 0)
    ) {
      icon = DiscordUtils.reference_attachment_icon;
    } else if (message.interaction) {
      icon = DiscordUtils.interaction_command_icon;
    }

    let [_, messageEditedAt] = this.set_time(message);

    if (messageEditedAt) {
      messageEditedAt = this.setEditAt(messageEditedAt);
    }

    const avatarUrl =
      message.author.displayAvatarURL() || DiscordUtils.default_avatar;
    this.reference = await fillOut(this.guild, message_reference, [
      ["AVATAR_URL", String(avatarUrl), PARSE_MODE_NONE],
      ["BOT_TAG", isBot, PARSE_MODE_NONE],
      ["NAME_TAG", `${message.author.username}`, PARSE_MODE_NONE],
      [
        "NAME",
        String(escapeHtml(message.author.username)),
        PARSE_MODE_MARKDOWN,
      ],
      ["USER_COLOUR", userColour, PARSE_MODE_NONE],
      ["CONTENT", message.content, PARSE_MODE_REFERENCE],
      ["EDIT", messageEditedAt, PARSE_MODE_NONE],
      ["ICON", icon, PARSE_MODE_NONE],
      ["USER_ID", String(message.author.id), PARSE_MODE_NONE],
      ["MESSAGE_ID", String(this.message.reference.messageId), PARSE_MODE_NONE],
    ]);
  }

  async build_interaction(): Promise<void> {
    if (!this.message.interaction) {
      this.interaction = "";
      return;
    }

    const user = this.message.interaction.user;
    const isBot = this._gather_user_bot(user);
    const userColour = await this._gather_user_colour(user);
    const avatarUrl = user.displayAvatarURL() || DiscordUtils.default_avatar;
    this.interaction = await fillOut(this.guild, message_interaction, [
      ["AVATAR_URL", avatarUrl, PARSE_MODE_NONE],
      ["BOT_TAG", isBot, PARSE_MODE_NONE],
      ["NAME_TAG", `${user.username}`, PARSE_MODE_NONE],
      ["NAME", escapeHtml(user.username), PARSE_MODE_NONE],
      ["USER_COLOUR", userColour, PARSE_MODE_NONE],
      ["FILLER", "used ", PARSE_MODE_NONE],
      ["COMMAND", `/${this.message.interaction?.commandName}`, PARSE_MODE_NONE],
      ["USER_ID", user.id, PARSE_MODE_NONE],
      ["INTERACTION_ID", this.message.interaction.id, PARSE_MODE_NONE],
    ]);
  }

  async build_sticker(): Promise<void> {
    if (this.message.stickers.size === 0) {
      return;
    }

    let stickerImageUrl = this.message.stickers.first()!.url;

    if (stickerImageUrl.endsWith(".json")) {
      const sticker = await this.message.stickers.first()!.fetch();
      stickerImageUrl = `https://cdn.jsdelivr.net/gh/mahtoid/DiscordUtils@master/stickers/${sticker.packId}/${sticker.id}.gif`;
    }

    this.attachments = await fillOut(this.guild, img_attachment, [
      ["ATTACH_URL", stickerImageUrl, PARSE_MODE_NONE],
      ["ATTACH_URL_THUMB", stickerImageUrl, PARSE_MODE_NONE],
    ]);
  }

  async build_assets(): Promise<void> {
    await this.build_attachments();
    await this.build_embeds();
    await this.build_components();
    await this.build_reactions();
  }

  async build_attachments(): Promise<void> {
    if (this.message.attachments.size > 0) {
      for (const attachment of this.message.attachments.values()) {
        this.attachments += await new Attachment(attachment, this.guild).flow();
      }
    }
  }

  async build_embeds(): Promise<void> {
    if (this.message.embeds.length > 0) {
      for (const embed of this.message.embeds) {
        this.embeds += await new Embed(embed, this.guild).flow();
      }
    }
  }

  async build_reactions(): Promise<void> {
    if (this.message.reactions.cache.size > 0) {
      for (const reaction of this.message.reactions.cache.values()) {
        this.reactions += await new Reaction(reaction, this.guild).flow();
      }
    }
  }

  set_time(message: Message | null = null): [string, string] {
    message = message || this.message;

    const created_at_str = this.to_local_time_str(message.createdAt);
    const edited_at_str = message.editedTimestamp
      ? this.to_local_time_str(message.editedTimestamp)
      : "";

    return [created_at_str, edited_at_str];
  }

  to_local_time_str(time: Date | number): string {
    if (!this.message.createdAt) {
      time = moment.tz(time, "UTC").toDate();
    }

    const local_time = time.toLocaleString(this.pytz_timezone);

    if (this.military_time) {
      return moment(time).format(this.time_format);
    }

    return moment(time).format(this.time_format);
  }

  async build_components(): Promise<void> {
    if (this.message.components.length > 0) {
      for (const component of this.message.components) {
        const componentInstance = new Component(component, this.guild);
        this.components += await componentInstance.flow();
      }
    }
  }
}

// Function to convert the message object to HTML
async function convertMessageToHTML(
  message: Message,
  previousMessage: Message | null,
  pytz_timezone: string,
  military_time: boolean,
  guild: Guild,
  meta_data: MetaData
): Promise<{ message_html: string; updated_meta_data: MetaData }> {
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

async function gatherMessages(
  messages: Collection<string, Message> | null,
  guild: Guild,
  pytz_timezone: string,
  military_time: boolean
): Promise<[string, MetaData]> {
  let message_html = "";
  let meta_data: MetaData = {};
  let previous_message: Message | null = null;
  if (!messages) {
    return ["", {}];
  }
  for (const message of messages) {
    const messageConstruct = new MessageConstruct(
      message[1],
      previous_message,
      pytz_timezone,
      military_time,
      guild,
      meta_data
    );

    const [content_html, updated_meta_data] =
      await messageConstruct.construct_message();

    message_html += content_html;
    previous_message = message[1];
    meta_data = updated_meta_data;
  }

  message_html += "</div>";
  return [message_html, meta_data];
}
export { convertMessageToHTML, MessageConstruct, gatherMessages };

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
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
