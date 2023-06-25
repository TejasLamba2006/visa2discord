const { fillOut, embed_body, embed_title, embed_description, embed_field, embed_field_inline, embed_footer, embed_footer_icon, embed_image, embed_thumbnail, embed_author, embed_author_icon, PARSE_MODE_NONE, PARSE_MODE_EMBED, PARSE_MODE_MARKDOWN, PARSE_MODE_SPECIAL_EMBED } = require('../../ext/html_gen.js');

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
  }

  async flow() {
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
    if (this.embed.colour) {
      this.color = this.embed.colour.toString(16).padStart(6, '0');
    } 
  }

  async build_title() {
    if (this.embed.title) {
      this.title = escapeHtml(this.embed.title);
      if (this.title) {
        this.title = await fillOut(this.guild, embed_title, [
          ["EMBED_TITLE", this.title, PARSE_MODE_MARKDOWN]
        ]);
      }
    } else {
      this.title = "";
    }
  }

  async build_description() {
    if (this.embed.description) {
      this.description = escapeHtml(this.embed.description);
      if (this.description) {
        this.description = await fillOut(this.guild, embed_description, [
          ["EMBED_DESC", this.description, PARSE_MODE_EMBED]
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
      field.name = escapeHtml(field.name);
      field.value = escapeHtml(field.value);
      if (field.inline) {
        this.fields += await fillOut(this.guild, embed_field_inline, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED]
        ]);
      } else {
        this.fields += await fillOut(this.guild, embed_field, [
          ["FIELD_NAME", field.name, PARSE_MODE_SPECIAL_EMBED],
          ["FIELD_VALUE", field.value, PARSE_MODE_EMBED]
        ]);
      }
    }
  }

  async build_author() {
    if (this.embed.author?.username) {
      this.author = escapeHtml(this.embed.author.username);
      if (this.embed.author.url) {
        this.author = `<a class="chatlog__embed-author-name-link" href="${this.embed.author.url}">${this.author}</a>`;
      }
      const author_icon = this.embed.author.url ? await fillOut(this.guild, embed_author_icon, [
        ["AUTHOR", this.author, PARSE_MODE_NONE],
        ["AUTHOR_ICON", this.embed.author.url, PARSE_MODE_NONE]
      ]) : "";
      if (author_icon === "" && this.author !== "") {
        this.author = await fillOut(this.guild, embed_author, [
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
    if (this.embed.image?.url) {
      this.image = await fillOut(this.guild, embed_image, [
        ["EMBED_IMAGE", this.embed.image.proxyURL, PARSE_MODE_NONE]
      ]);
    } else {
      this.image = "";
    }
  }

  async build_thumbnail() {
    if (this.embed.thumbnail?.url) {
      this.thumbnail = await fillOut(this.guild, embed_thumbnail, [
        ["EMBED_THUMBNAIL", this.embed.thumbnail.url, PARSE_MODE_NONE]
      ]);
    } else {
      this.thumbnail = "";
    }
  }

  async build_footer() {
    if (this.embed.footer?.text) {
      this.footer = escapeHtml(this.embed.footer.text);
      const footer_icon = this.embed.footer?.icon? this.embed.footer.icon : null;
      if (!this.footer) {
        return;
      }
      if (footer_icon) {
        this.footer = await fillOut(this.guild, embed_footer_icon, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE],
          ["EMBED_FOOTER_ICON", footer_icon, PARSE_MODE_NONE]
        ]);
      } else {
        this.footer = await fillOut(this.guild, embed_footer, [
          ["EMBED_FOOTER", this.footer, PARSE_MODE_NONE]
        ]);
      }
    } else {
      this.footer = "";
    }
  }

  async build_embed() {
    this.embed = await fillOut(this.guild, embed_body, [
      ["EMBED_COLOR", String(this.color)],
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

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}
