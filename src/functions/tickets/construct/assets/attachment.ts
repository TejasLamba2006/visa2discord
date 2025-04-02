import { Guild, Attachment as DiscordAttachment } from "discord.js";
import { DiscordUtils } from "../../ext/discordUtils.js";
import {
  fillOut,
  img_attachment,
  msg_attachment,
  audio_attachment,
  video_attachment,
  PARSE_MODE_NONE,
} from "../../ext/htmlGen.js";

export default class Attachment {
  attachments: string;
  rawAttachments: DiscordAttachment;
  guild: Guild;

  constructor(rawAttachments: DiscordAttachment, guild: Guild) {
    this.rawAttachments = rawAttachments;
    this.guild = guild;
    this.attachments = "";
  }

  async flow(): Promise<DiscordAttachment | string> {
    await this.build_attachment();
    return this.attachments;
  }

  async build_attachment(): Promise<void> {
    if (this.rawAttachments.contentType) {
      if (this.rawAttachments.contentType.includes("image")) {
        await this.image();
      } else if (this.rawAttachments.contentType.includes("video")) {
        await this.video();
      } else if (this.rawAttachments.contentType.includes("audio")) {
        await this.audio();
      } else {
        await this.file();
      }
    } else {
      await this.file();
    }
  }

  async image(): Promise<void> {
    this.attachments = await fillOut(this.guild, img_attachment, [
      ["ATTACH_URL", this.rawAttachments.proxyURL, PARSE_MODE_NONE],
      ["ATTACH_URL_THUMB", this.rawAttachments.proxyURL, PARSE_MODE_NONE],
    ]);
  }

  async video(): Promise<void> {
    this.attachments = await fillOut(this.guild, video_attachment, [
      ["ATTACH_URL", this.rawAttachments.proxyURL, PARSE_MODE_NONE],
    ]);
  }

  async audio(): Promise<void> {
    const file_icon = DiscordUtils.file_attachment_audio;
    const file_size = this.get_file_size(this.rawAttachments.size);
    this.attachments = await fillOut(this.guild, audio_attachment, [
      ["ATTACH_ICON", file_icon, PARSE_MODE_NONE],
      ["ATTACH_URL", this.rawAttachments.proxyURL, PARSE_MODE_NONE],
      ["ATTACH_BYTES", file_size, PARSE_MODE_NONE],
      ["ATTACH_AUDIO", this.rawAttachments.proxyURL, PARSE_MODE_NONE],
      ["ATTACH_FILE", this.rawAttachments.name, PARSE_MODE_NONE],
    ]);
  }

  async file(): Promise<void> {
    const file_icon = await this.get_file_icon();
    const file_size = this.get_file_size(this.rawAttachments.size);
    this.attachments = await fillOut(this.guild, msg_attachment, [
      ["ATTACH_ICON", file_icon, PARSE_MODE_NONE],
      ["ATTACH_URL", this.rawAttachments.url, PARSE_MODE_NONE],
      ["ATTACH_BYTES", file_size, PARSE_MODE_NONE],
      ["ATTACH_FILE", this.rawAttachments.name, PARSE_MODE_NONE],
    ]);
  }

  get_file_size(file_size: number): string {
    if (file_size === 0) {
      return "0 bytes";
    }
    const size_name = ["bytes", "KB", "MB"];
    const i = Math.floor(Math.log(file_size) / Math.log(1024));
    const p = Math.pow(1024, i);
    const s = (file_size / p).toFixed(2);
    return `${s} ${size_name[i]}`;
  }

  async get_file_icon(): Promise<string> {
    const acrobat_types = ["pdf"];
    const webcode_types = ["html", "htm", "css", "rss", "xhtml", "xml"];
    const code_types = [
      "py",
      "cgi",
      "pl",
      "gadget",
      "jar",
      "msi",
      "wsf",
      "bat",
      "php",
      "js",
    ];
    const document_types = [
      "txt",
      "doc",
      "docx",
      "rtf",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "odt",
      "odp",
      "ods",
      "odg",
      "odf",
      "swx",
      "sxi",
      "sxc",
      "sxd",
      "stw",
    ];
    const archive_types = [
      "br",
      "rpm",
      "dcm",
      "epub",
      "zip",
      "tar",
      "rar",
      "gz",
      "bz2",
      "7x",
      "deb",
      "ar",
      "Z",
      "lzo",
      "lz",
      "lz4",
      "arj",
      "pkg",
      "z",
    ];

    const extension = this.rawAttachments.url.split(".").pop()!.toLowerCase();
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
