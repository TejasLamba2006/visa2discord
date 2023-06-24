const discord = require('discord.js'); // Assuming discord package is installed

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
  PARSE_MODE_REFERENCE
} = require('../ext/html_gen.js'); // Import the HTML generator functions

class MessageConstruct {
  message_html = '';
  embeds = '';
  reactions = '';
  components = '';
  attachments = '';
  time_format = '';

  constructor(
    message,
    previous_message,
    pytz_timezone,
    military_time,
    guild,
    meta_data
  ) {
    this.message = message;
    this.previous_message = previous_message;
    this.pytz_timezone = pytz_timezone;
    this.military_time = military_time;
    this.guild = guild;

    this.time_format = '%A, %e %B %Y %I:%M %p';
    if (this.military_time) {
      this.time_format = '%A, %e %B %Y %H:%M';
    }

    const [message_created_at, message_edited_at] = this.set_time();
    this.message_created_at = message_created_at;
    this.message_edited_at = message_edited_at;
    this.meta_data = meta_data;
  }

  async construct_message() {
    if (discord.MessageType.pins_add === this.message.type) {
      await this.build_pin();
    } else if (discord.MessageType.thread_created === this.message.type) {
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

  async build_pin() {
    await this.generate_message_divider(true);
    await this.build_pin_template();
  }

  async build_thread() {
    await this.generate_message_divider(true);
    await this.build_thread_template();
  }

  async build_meta_data() {
    const user_id = this.message.author.id;

    if (user_id in this.meta_data) {
      this.meta_data[user_id][4] += 1;
    } else {
      const user_name_discriminator = `${this.message.author.name}#${this.message.author.discriminator}`;
      const user_created_at = this.message.author.created_at;
      const user_bot = this._gather_user_bot(this.message.author);
      const user_avatar = this.message.author.display_avatar || DiscordUtils.default_avatar;
      const user_joined_at = this.message.author.joined_at || null;
      const user_display_name = this.message.author.display_name !== this.message.author.name
        ? `<div class="meta__display-name">${this.message.author.display_name}</div>`
        : '';
      this.meta_data[user_id] = [
        user_name_discriminator,
        user_created_at,
        user_bot,
        user_avatar,
        1,
        user_joined_at,
        user_display_name
      ];
    }
  }

  async build_content() {
    if (!this.message.content) {
      this.message.content = '';
      return;
    }

    if (this.message_edited_at) {
      this.message_edited_at = this.message_edited_at.tz(this.pytz_timezone);
      const formatted_edited_at = this.message_edited_at.format(this.time_format);

      const edited_indicator = this.message.edited
        ? `<span class="edited-indicator"> (edited: ${formatted_edited_at})</span>`
        : '';

      this.message_html += `<div class="message__content">${this.message.content}${edited_indicator}</div>`;
    }
  }

  async build_reference() {
    if (this.message_reference && this.message_reference.type === discord.MessageType.default) {
      const referenced_message_id = this.message_reference.message_id;
      const referenced_channel_id = this.message_reference.channel_id;

      let referenced_message_html = '';

      if (referenced_channel_id && referenced_message_id) {
        const referenced_channel = this.guild.channels.get(referenced_channel_id);
        const referenced_message = await referenced_channel.fetchMessage(referenced_message_id);

        if (referenced_message) {
          const referenced_message_construct = new MessageConstruct(
            referenced_message,
            this.previous_message,
            this.pytz_timezone,
            this.military_time,
            this.guild,
            this.meta_data
          );
          [referenced_message_html, this.meta_data] = await referenced_message_construct.construct_message();
        }
      }

      if (referenced_message_html) {
        this.message_html += `<div class="message__reference">${referenced_message_html}</div>`;
      } else {
        this.message_html += `<div class="message__reference">${message_reference_unknown}</div>`;
      }
    }
  }

  async build_interaction() {
    if (this.message_interaction) {
      const interaction_user_id = this.message_interaction.user_id;
      const interaction_user = await this.guild.fetchMember(interaction_user_id);
      const interaction_user_name = interaction_user ? interaction_user.displayName : '';

      const interaction_type = this.message_interaction.type;
      let interaction_text = '';

      if (interaction_type === discord.InteractionType.applicationCommand) {
        interaction_text = `Interacted with ${interaction_user_name}: ${this.message_interaction.commandName}`;
      } else if (interaction_type === discord.InteractionType.messageComponent) {
        interaction_text = `Interacted with ${interaction_user_name}: ${this.message_interaction.customId}`;
      }

      if (interaction_text) {
        this.message_html += `<div class="message__interaction">${interaction_text}</div>`;
      }
    }
  }

  async build_sticker() {
    if (this.message.stickerItems.size > 0) {
      const sticker_item = this.message.stickerItems.first();
      const sticker_url = sticker_item.stickerURL;
      this.message_html += `<div class="message__sticker"><img src="${sticker_url}" alt="Sticker"></div>`;
    }
  }

  async build_assets() {
    await this.build_attachments();
    await this.build_embeds();
    await this.build_reactions();
    await this.build_components();
  }

  async build_attachments() {
    if (this.message.attachments.size > 0) {
      this.message.attachments.forEach(attachment => {
        const attachment_url = attachment.url;
        this.attachments += img_attachment(attachment_url);
      });
    }
  }

  async build_embeds() {
    if (this.message.embeds.size > 0) {
      this.message.embeds.forEach(embed => {
        // Extract necessary information from the embed object
        const embed_title = embed.title || '';
        const embed_type = embed.type || '';
        const embed_description = embed.description || '';
        const embed_url = embed.url || '';
        const embed_color = embed.color || '';
        const embed_fields = embed.fields || [];
        const embed_footer = embed.footer ? embed.footer.text || '' : '';
        const embed_image = embed.image ? embed.image.url || '' : '';
        const embed_thumbnail = embed.thumbnail ? embed.thumbnail.url || '' : '';
        const embed_author = embed.author ? embed.author.name || '' : '';

        // Build the HTML structure for the embed
        let embed_html = `<div class="message__embed">`;

        if (embed_title) {
          embed_html += `<div class="embed__title">${embed_title}</div>`;
        }

        if (embed_type) {
          embed_html += `<div class="embed__type">${embed_type}</div>`;
        }

        if (embed_description) {
          embed_html += `<div class="embed__description">${embed_description}</div>`;
        }

        if (embed_url) {
          embed_html += `<div class="embed__url">${embed_url}</div>`;
        }

        if (embed_color) {
          embed_html += `<div class="embed__color">${embed_color}</div>`;
        }

        if (embed_fields.length > 0) {
          embed_html += `<div class="embed__fields">`;
          embed_fields.forEach(field => {
            const field_name = field.name || '';
            const field_value = field.value || '';
            const field_inline = field.inline ? 'inline' : 'not-inline';
            embed_html += `<div class="embed__field ${field_inline}"><span class="field__name">${field_name}</span><span class="field__value">${field_value}</span></div>`;
          });
          embed_html += `</div>`;
        }

        if (embed_footer) {
          embed_html += `<div class="embed__footer">${embed_footer}</div>`;
        }

        if (embed_image) {
          embed_html += `<div class="embed__image"><img src="${embed_image}" alt="Embed Image"></div>`;
        }

        if (embed_thumbnail) {
          embed_html += `<div class="embed__thumbnail"><img src="${embed_thumbnail}" alt="Embed Thumbnail"></div>`;
        }

        if (embed_author) {
          embed_html += `<div class="embed__author">${embed_author}</div>`;
        }

        embed_html += `</div>`;

        this.message_html += embed_html;
      });
    }
  }

  async build_reactions() {
    if (this.message.reactions.size > 0) {
      this.message.reactions.forEach(reaction => {
        const reaction_emoji = reaction.emoji;
        const reaction_count = reaction.count;
        const reaction_html = `<span class="reaction">${reaction_emoji} ${reaction_count}</span>`;
        this.reactions_html += reaction_html;
      });

      if (this.reactions_html) {
        this.message_html += `<div class="message__reactions">${this.reactions_html}</div>`;
      }
    }
  }

  async build_components() {
    if (this.message.components.length > 0) {
      this.message.components.forEach(component => {
        const component_type = component.type;
        let component_html = '';

        if (component_type === discord.MessageComponentType.actionRow) {
          component_html += `<div class="component__action-row">`;

          component.components.forEach(subcomponent => {
            const subcomponent_type = subcomponent.type;
            let subcomponent_html = '';

            if (subcomponent_type === discord.ButtonType.primary || subcomponent_type === discord.ButtonType.secondary) {
              const button_label = subcomponent.label;
              const button_style = subcomponent.style || 'primary';
              const button_disabled = subcomponent.disabled ? 'disabled' : '';

              subcomponent_html += `<button class="component__button ${button_style} ${button_disabled}">${button_label}</button>`;
            }

            component_html += subcomponent_html;
          });

          component_html += `</div>`;
        }

        this.components_html += component_html;
      });

      if (this.components_html) {
        this.message_html += `<div class="message__components">${this.components_html}</div>`;
      }
    }
  }
}
async function gatherMessages(messages, guild, pytz_timezone, military_time) {
  let message_html = "";
  let meta_data = {};
  let previous_message = null;

  for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageConstruct = new MessageConstruct(
          message,
          previous_message,
          pytz_timezone,
          military_time,
          guild,
          meta_data
      );
      const [content_html, updated_meta_data] = await messageConstruct.construct_message();
      message_html += content_html;
      previous_message = message;
      meta_data = updated_meta_data;
  }

  message_html += "</div>";
  return [message_html, meta_data];
}
// Function to convert the message object to HTML
async function convertMessageToHTML(message, previousMessage, pytz_timezone, military_time, guild, meta_data) {
  const messageConstruct = new MessageConstruct(message, previousMessage, pytz_timezone, military_time, guild, meta_data);
  const [message_html, updated_meta_data] = await messageConstruct.construct_message();
  return { message_html, updated_meta_data };
}
module.exports = MessageConstruct
module.exports = {
  convertMessageToHTML,
  gatherMessages
}