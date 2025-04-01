import ParseMentionFlow from "../parse/ParseMentionFlow";
import ParseMarkdown from "../parse/ParseMarkdown";
import * as path from "path";
import * as fs from "fs";
import { Guild } from "discord.js";

const dir_path = path.join(path.dirname(path.resolve(__filename)), "..");

const PARSE_MODE_NONE = 0;
const PARSE_MODE_NO_MARKDOWN = 1;
const PARSE_MODE_MARKDOWN = 2;
const PARSE_MODE_EMBED = 3;
const PARSE_MODE_SPECIAL_EMBED = 4;
const PARSE_MODE_REFERENCE = 5;
const PARSE_MODE_EMOJI = 6;

async function fillOut(
  guild: Guild,
  base: string,
  replacements: [string, string, number][] | [string, string][]
): Promise<string> {
  for (let r of replacements) {
    let k: string, v: string, mode: number;
    if (r.length === 2) {
      [k, v] = r;
      mode = PARSE_MODE_MARKDOWN;
    } else {
      [k, v, mode] = r;
    }
    if (mode === PARSE_MODE_MARKDOWN) {
      v = await new ParseMentionFlow(v, guild).flow();
      v = await new ParseMarkdown(v).standardMessageFlow();
    } else if (mode === PARSE_MODE_EMBED) {
      v = await new ParseMentionFlow(v, guild).flow();
      v = await new ParseMarkdown(v).standardEmbedFlow();
    } else if (mode === PARSE_MODE_SPECIAL_EMBED) {
      v = await new ParseMentionFlow(v, guild).flow();
      v = await new ParseMarkdown(v).specialEmbedFlow();
    } else if (mode === PARSE_MODE_REFERENCE) {
      v = await new ParseMentionFlow(v, guild).flow();
      v = await new ParseMarkdown(v).messageReferenceFlow();
    } else if (mode === PARSE_MODE_EMOJI) {
      v = await new ParseMarkdown(v).specialEmojiFlow();
    }

    const regex = new RegExp("{{" + k + "}}", "g");
    base = base.replace(regex, v);
  }
  return base;
}

function read_file(filename: string): string {
  return fs.readFileSync(filename, "utf-8");
}

// MESSAGES
const start_message = read_file(
  path.join(dir_path, "/html/message/start.html")
);
const bot_tag = read_file(path.join(dir_path, "/html/message/bot-tag.html"));
const bot_tag_verified = read_file(
  path.join(dir_path, "/html/message/bot-tag-verified.html")
);
const message_content = read_file(
  path.join(dir_path, "/html/message/content.html")
);
const message_reference = read_file(
  path.join(dir_path, "/html/message/reference.html")
);
const message_interaction = read_file(
  path.join(dir_path, "/html/message/interaction.html")
);
const message_pin = read_file(path.join(dir_path, "/html/message/pin.html"));
const message_thread = read_file(
  path.join(dir_path, "/html/message/thread.html")
);
const message_reference_unknown = read_file(
  path.join(dir_path, "/html/message/reference_unknown.html")
);
const message_body = read_file(
  path.join(dir_path, "/html/message/message.html")
);
const end_message = read_file(path.join(dir_path, "/html/message/end.html"));
const meta_data_temp = read_file(
  path.join(dir_path, "/html/message/meta.html")
);

// COMPONENTS
const component_button = read_file(
  path.join(dir_path, "/html/component/component_button.html")
);
const component_menu = read_file(
  path.join(dir_path, "/html/component/component_menu.html")
);
const component_menu_options = read_file(
  path.join(dir_path, "/html/component/component_menu_options.html")
);
const component_menu_options_emoji = read_file(
  path.join(dir_path, "/html/component/component_menu_options_emoji.html")
);

// EMBED
const embed_body = read_file(path.join(dir_path, "/html/embed/body.html"));
const embed_title = read_file(path.join(dir_path, "/html/embed/title.html"));
const embed_description = read_file(
  path.join(dir_path, "/html/embed/description.html")
);
const embed_field = read_file(path.join(dir_path, "/html/embed/field.html"));
const embed_field_inline = read_file(
  path.join(dir_path, "/html/embed/field-inline.html")
);
const embed_footer = read_file(path.join(dir_path, "/html/embed/footer.html"));
const embed_footer_icon = read_file(
  path.join(dir_path, "/html/embed/footer_image.html")
);
const embed_image = read_file(path.join(dir_path, "/html/embed/image.html"));
const embed_thumbnail = read_file(
  path.join(dir_path, "/html/embed/thumbnail.html")
);
const embed_author = read_file(path.join(dir_path, "/html/embed/author.html"));
const embed_author_icon = read_file(
  path.join(dir_path, "/html/embed/author_icon.html")
);

// REACTION
const emoji = read_file(path.join(dir_path, "/html/reaction/emoji.html"));
const custom_emoji = read_file(
  path.join(dir_path, "/html/reaction/custom_emoji.html")
);

// ATTACHMENT
const img_attachment = read_file(
  path.join(dir_path, "/html/attachment/image.html")
);
const msg_attachment = read_file(
  path.join(dir_path, "/html/attachment/message.html")
);
const audio_attachment = read_file(
  path.join(dir_path, "/html/attachment/audio.html")
);
const video_attachment = read_file(
  path.join(dir_path, "/html/attachment/video.html")
);

// GUILD / FULL TRANSCRIPT
const total = read_file(path.join(dir_path, "/html/base.html"));

// SCRIPT
const fancyTime = read_file(
  path.join(dir_path, "/html/script/fancy_time.html")
);
const channelTopic = read_file(
  path.join(dir_path, "/html/script/channel_topic.html")
);
const channelSubject = read_file(
  path.join(dir_path, "/html/script/channel_subject.html")
);

export {
  fillOut,
  read_file,
  start_message,
  bot_tag,
  bot_tag_verified,
  message_content,
  message_reference,
  message_interaction,
  message_pin,
  message_thread,
  message_reference_unknown,
  message_body,
  end_message,
  meta_data_temp,
  component_button,
  component_menu,
  component_menu_options,
  component_menu_options_emoji,
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
  emoji,
  custom_emoji,
  img_attachment,
  msg_attachment,
  audio_attachment,
  video_attachment,
  total,
  fancyTime,
  channelTopic,
  channelSubject,
  PARSE_MODE_NONE,
  PARSE_MODE_NO_MARKDOWN,
  PARSE_MODE_MARKDOWN,
  PARSE_MODE_EMBED,
  PARSE_MODE_SPECIAL_EMBED,
  PARSE_MODE_REFERENCE,
  PARSE_MODE_EMOJI,
};
