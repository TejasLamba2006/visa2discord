const html = require('html');

const discord = require('discord.js');

const { fill_out, embed_body, embed_title, embed_description, embed_field, embed_field_inline, embed_footer, embed_footer_icon, embed_image, embed_thumbnail, embed_author, embed_author_icon, PARSE_MODE_NONE, PARSE_MODE_EMBED, PARSE_MODE_MARKDOWN, PARSE_MODE_SPECIAL_EMBED } = require('../../ext/html_gen.js');

const modules_which_use_none = ["nextcord", "disnake"];

function _gather_checker() {
  if (!modules_which_use_none.includes(discord.module) && discord.Embed.Empty) {
    return discord.Embed.Empty;
  }
  return null;
}

class Embed {
  constructor(embed, guild) {
    this.embed = embed;
    this.guild = guild;
    this.r = null;
    this.g = null;
    this.b = null;
    this.title = null;
    this.description = null;
    this.author = null;
    this.image = null;
    this.thumbnail = null;
    this.footer = null;
    this.fields = null;
    this.check_against = null;
  }

  async flow() {
    this.check_against = _gather_checker();
    this.build_colour();
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

  build_colour() {
    if (this.embed.colour !== this.check_against) {
      this.r = this.embed.colour.r;
      this.g = this.embed.colour.g;
      this.b = this.embed.colour.b;
    } else {
      this.r = 0x20;
      this.g = 0x22;
      this.b = 0x25;
    }
  }

  async build_title() {
    if (this.embed.title !== this.check_against) {
      this.title = html.escape(this.embed.title);
      if (this.title) {
        this.title = await fill_out(this.guild, embed_title, [
          ["EMBED_TITLE", this.title, PARSE_MODE_MARKDOWN]
        ]);
      }
    } else {
      this.title = "";
    }
  }

  async build_description() {
    if (this.embed.description !== this.check_against) {
      this.description = html.escape(this.embed.description);
      if (this.description) {
        this.description = await fill_out(this.guild, embed_description, [
          ["EMBED_DESC", this.embed.description, PARSE_MODE_EMBED]
        ]);
      }
    } else {
      this.description = "";
    }
  }

  async build_fields() {
    this.fields = "";
    if (!this.embed.fields) {
      return;
    }
    for (const field of this.embed.fields) {
      field.name = html.escape(field.name);
      field.value = html.escape(field.value);
      if (field.inline) {
        this.fields += await fill_out(this.guild, embed_field_inline, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED]
        ]);
      } else {
        this.fields += await fill_out(this.guild, embed_field, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED]
        ]);
      }
    }
  }

  async build_author() {
    if (this.embed.author.name !== this.check_against) {
      this.author = html.escape(this.embed.author.name);
      if (this.embed.author.url !== this.check_against) {
        this.author = `<a class="chatlog__embed-author-name-link" href="${this.embed.author.url}">${this.author}</a>`;
      }
      const author_icon = this.embed.author.iconURL !== this.check_against ? await fill_out(this.guild, embed_author_icon, [
        ["AUTHOR", this.author, PARSE_MODE_NONE],
        ["AUTHOR_ICON", this.embed.author.iconURL, PARSE_MODE_NONE]
      ]) : "";
      if (author_icon === "" && this.author !== "") {
        this.author = await fill_out(this.guild, embed_author, [
          ["AUTHOR", this.author, PARSE_MODE_NONE]
        ]);
      } else {
        this.author = author_icon;
      }
    } else {
      this.author = "";
    }
  }

  async build_image() {
    if (this.embed.image.url !== this.check_against) {
      this.image = await fill_out(this.guild, embed_image, [
        ["EMBED_IMAGE", this.embed.image.proxyURL, PARSE_MODE_NONE]
      ]);
    } else {
      this.image = "";
    }
  }

  async build_thumbnail() {
    if (this.embed.thumbnail.url !== this.check_against) {
      this.thumbnail = await fill_out(this.guild, embed_thumbnail, [
        ["EMBED_THUMBNAIL", this.embed.thumbnail.url, PARSE_MODE_NONE]
      ]);
    } else {
      this.thumbnail = "";
    }
  }

  async build_footer() {
    if (this.embed.footer.text !== this.check_against) {
      this.footer = html.escape(this.embed.footer.text);
      const footer_icon = this.embed.footer.iconURL !== this.check_against ? this.embed.footer.iconURL : null;
      if (!this.footer) {
        return;
      }
      if (footer_icon) {
        this.footer = await fill_out(this.guild, embed_footer_icon, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE],
          ["EMBED_FOOTER_ICON", footer_icon, PARSE_MODE_NONE]
        ]);
      } else {
        this.footer = await fill_out(this.guild, embed_footer, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE]
        ]);
      }
    } else {
      this.footer = "";
    }
  }

  async build_embed() {
    this.embed = await fill_out(this.guild, embed_body, [
      ["EMBED_R", String(this.r)],
      ["EMBED_G", String(this.g)],
      ["EMBED_B", String(this.b)],
      ["EMBED_AUTHOR", this.author, PARSE_MODE_NONE],
      ["EMBED_TITLE", this.title, PARSE_MODE_NONE],
      ["EMBED_IMAGE", this.image, PARSE_MODE_NONE],
      ["EMBED_THUMBNAIL", this.thumbnail, PARSE_MODE_NONE],
      ["EMBED_DESC", this.description, PARSE_MODE_NONE],
      ["EMBED_FIELDS", this.fields, PARSE_MODE_NONE],
      ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE]
    ]);
  }
}

module.exports = {
  Embed
};