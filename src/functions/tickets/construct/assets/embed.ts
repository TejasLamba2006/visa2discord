import { Guild, EmbedBuilder, Embed as DiscordEmbed } from "discord.js";
import {
  fillOut,
  embed_body,
  embed_title,
  embed_description,
  embed_field,
  embed_field_inline,
  embed_footer,
  embed_footer_icon,
  embed_image,
  embed_thumbnail,
  embed_author,
  embed_author_icon,
  PARSE_MODE_NONE,
  PARSE_MODE_EMBED,
  PARSE_MODE_MARKDOWN,
  PARSE_MODE_SPECIAL_EMBED,
} from "../../ext/htmlGen.js";

class Embed {
  rawEmbed: DiscordEmbed;
  embed: string;
  guild: Guild;
  title: string | null;
  description: string | null;
  author: string | null;
  image: string | null;
  thumbnail: string | null;
  footer: string | null;
  fields: string | null;

  constructor(rawEmbed: DiscordEmbed, guild: Guild) {
    this.rawEmbed = rawEmbed;
    this.guild = guild;
    this.title = null;
    this.description = null;
    this.author = null;
    this.image = null;
    this.thumbnail = null;
    this.footer = null;
    this.fields = null;
    this.embed = "";
  }

  async flow(): Promise<EmbedBuilder | string> {
    await this.build_title();
    await this.build_description();
    await this.build_fields();
    await this.build_author();
    await this.build_image();
    await this.build_thumbnail();
    await this.build_footer();
    await this.build_embed();
    return this.embed;
  }

  async build_title(): Promise<void> {
    if (this.rawEmbed.title) {
      this.title = escapeHtml(this.rawEmbed.title);
      if (this.title) {
        this.title = await fillOut(this.guild, embed_title, [
          ["EMBED_TITLE", this.title, PARSE_MODE_MARKDOWN],
        ]);
      }
    } else {
      this.title = "";
    }
  }

  async build_description(): Promise<void> {
    if (this.rawEmbed.description) {
      this.description = escapeHtml(this.rawEmbed.description);
      if (this.description) {
        this.description = await fillOut(this.guild, embed_description, [
          ["EMBED_DESC", this.description, PARSE_MODE_EMBED],
        ]);
      }
    } else {
      this.description = "";
    }
  }

  async build_fields(): Promise<void> {
    this.fields = "";
    if (!this.rawEmbed.fields) {
      return;
    }
    for (const field of this.rawEmbed.fields) {
      field.name = escapeHtml(field.name);
      field.value = escapeHtml(field.value);
      if (field.inline) {
        this.fields += await fillOut(this.guild, embed_field_inline, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED],
        ]);
      } else {
        this.fields += await fillOut(this.guild, embed_field, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED],
        ]);
      }
    }
  }

  async build_author(): Promise<void> {
    if (this.rawEmbed.author?.name) {
      this.author = escapeHtml(this.rawEmbed.author.name);
      if (this.rawEmbed.author.url) {
        this.author = `<a class="chatlog__embed-author-name-link" href="${this.rawEmbed.author.url}">${this.author}</a>`;
      }
      const author_icon = this.rawEmbed.author.iconURL
        ? await fillOut(this.guild, embed_author_icon, [
            ["AUTHOR", this.author, PARSE_MODE_NONE],
            ["AUTHOR_ICON", this.rawEmbed.author.iconURL, PARSE_MODE_NONE],
          ])
        : "";
      if (author_icon === "" && this.author !== "") {
        this.author = await fillOut(this.guild, embed_author, [
          ["AUTHOR", this.author, PARSE_MODE_NONE],
        ]);
      } else {
        this.author = author_icon;
      }
    } else {
      this.author = "";
    }
  }

  async build_image(): Promise<void> {
    if (this.rawEmbed.image?.url) {
      this.image = await fillOut(this.guild, embed_image, [
        [
          "EMBED_IMAGE",
          this.rawEmbed.image.proxyURL ?? this.rawEmbed.image.url,
          PARSE_MODE_NONE,
        ],
      ]);
    } else {
      this.image = "";
    }
  }

  async build_thumbnail(): Promise<void> {
    if (this.rawEmbed.thumbnail?.url) {
      this.thumbnail = await fillOut(this.guild, embed_thumbnail, [
        ["EMBED_THUMBNAIL", this.rawEmbed.thumbnail.url, PARSE_MODE_NONE],
      ]);
    } else {
      this.thumbnail = "";
    }
  }

  async build_footer(): Promise<void> {
    if (this.rawEmbed.footer?.text) {
      this.footer = escapeHtml(this.rawEmbed.footer.text);
      const footer_icon = this.rawEmbed.footer.iconURL
        ? this.rawEmbed.footer.iconURL
        : null;
      if (!this.footer) {
        return;
      }
      if (footer_icon) {
        this.footer = await fillOut(this.guild, embed_footer_icon, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE],
          ["EMBED_FOOTER_ICON", footer_icon, PARSE_MODE_NONE],
        ]);
      } else {
        this.footer = await fillOut(this.guild, embed_footer, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE],
        ]);
      }
    } else {
      this.footer = "";
    }
  }

  async build_embed(): Promise<void> {
    this.embed = await fillOut(this.guild, embed_body, [
      ["EMBED_COLOR", this.rawEmbed.hexColor ?? "", PARSE_MODE_MARKDOWN],
      ["EMBED_AUTHOR", this.author ?? "", PARSE_MODE_NONE],
      ["EMBED_TITLE", this.title ?? "", PARSE_MODE_NONE],
      ["EMBED_IMAGE", this.image ?? "", PARSE_MODE_NONE],
      ["EMBED_THUMBNAIL", this.thumbnail ?? "", PARSE_MODE_NONE],
      ["EMBED_DESC", this.description ?? "", PARSE_MODE_NONE],
      ["EMBED_FIELDS", this.fields ?? "", PARSE_MODE_NONE],
      ["EMBED_FOOTER", this.footer ?? "", PARSE_MODE_NONE],
    ]);
  }
}

export { Embed };

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
