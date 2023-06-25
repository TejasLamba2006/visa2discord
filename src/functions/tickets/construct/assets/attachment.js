const { DiscordUtils } = require('../../ext/discord_utils');
const { fillOut, img_attachment, msg_attachment, audio_attachment, video_attachment, PARSE_MODE_NONE } = require('../../ext/html_gen.js');

class Attachment {
  constructor(attachments, guild) {
    this.attachments = attachments;
    this.guild = guild;
  }

  async flow() {
    await this.build_attachment();
    return this.attachments;
  }

  async build_attachment() {
    if (this.attachments.contentType !== null) {
      if (this.attachments.contentType.includes("image")) {
        return await this.image();
      } else if (this.attachments.contentType.includes("video")) {
        return await this.video();
      } else if (this.attachments.contentType.includes("audio")) {
        return await this.audio();
      }
    }
    await this.file();
  }

  async image() {
    this.attachments = await fillOut(this.guild, img_attachment, [
      ["ATTACH_URL", this.attachments.proxy_url, PARSE_MODE_NONE],
      ["ATTACH_URL_THUMB", this.attachments.proxy_url, PARSE_MODE_NONE]
    ]);
  }

  async video() {
    this.attachments = await fillOut(this.guild, video_attachment, [
      ["ATTACH_URL", this.attachments.proxy_url, PARSE_MODE_NONE]
    ]);
  }

  async audio() {
    const file_icon = DiscordUtils.file_attachment_audio;
    const file_size = this.get_file_size(this.attachments.size);

    this.attachments = await fillOut(this.guild, audio_attachment, [
      ["ATTACH_ICON", file_icon, PARSE_MODE_NONE],
      ["ATTACH_URL", this.attachments.url, PARSE_MODE_NONE],
      ["ATTACH_BYTES", String(file_size), PARSE_MODE_NONE],
      ["ATTACH_AUDIO", this.attachments.proxy_url, PARSE_MODE_NONE],
      ["ATTACH_FILE", String(this.attachments.filename), PARSE_MODE_NONE]
    ]);
  }

  async file() {
    const file_icon = await this.get_file_icon();
    const file_size = this.get_file_size(this.attachments.size);

    this.attachments = await fillOut(this.guild, msg_attachment, [
      ["ATTACH_ICON", file_icon, PARSE_MODE_NONE],
      ["ATTACH_URL", this.attachments.url, PARSE_MODE_NONE],
      ["ATTACH_BYTES", String(file_size), PARSE_MODE_NONE],
      ["ATTACH_FILE", String(this.attachments.filename), PARSE_MODE_NONE]
    ]);
  }

  get_file_size(file_size) {
    if (file_size === 0) {
      return "0 bytes";
    }
    const size_name = ["bytes", "KB", "MB"];
    const i = Math.floor(Math.log(file_size, 1024));
    const p = Math.pow(1024, i);
    const s = Math.round(file_size / p, 2);
    return `${s} ${size_name[i]}`;
  }

  async get_file_icon() {
    const acrobat_types = ["pdf"];
    const webcode_types = ["html", "htm", "css", "rss", "xhtml", "xml"];
    const code_types = ["py", "cgi", "pl", "gadget", "jar", "msi", "wsf", "bat", "php", "js"];
    const document_types = ["txt", "doc", "docx", "rtf", "xls", "xlsx", "ppt", "pptx", "odt", "odp", "ods", "odg", "odf", "swx", "sxi", "sxc", "sxd", "stw"];
    const archive_types = ["br", "rpm", "dcm", "epub", "zip", "tar", "rar", "gz", "bz2", "7x", "deb", "ar", "Z", "lzo", "lz", "lz4", "arj", "pkg", "z"];

    const extension = this.attachments.url.split('.').pop();
    if (acrobat_types.includes(extension)) {
      return DiscordUtils.file_attachment_acrobat;
    } else if (webcode_types.includes(extension)) {
      return DiscordUtils.file_attachment_webcode;
    } else if (code_types.includes(extension)) {
      return DiscordUtils.file_attachment_code;
    } else if (document_types.includes(extension)) {
      return DiscordUtils.file_attachment_document;
    } else if (archive_types.includes(extension)) {
      return DiscordUtils.file_attachment_archive;
    } else {
      return DiscordUtils.file_attachment_unknown;
    }
  }
}

module.exports = {
  Attachment
};
