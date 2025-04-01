import {
  Guild,
  ButtonComponent,
  ButtonStyle,
  APISelectMenuOption,
  StringSelectMenuComponent,
  ActionRow,
  MessageActionRowComponent,
} from "discord.js";
import { DiscordUtils } from "../../ext/discordUtils.js";
import {
  fillOut,
  component_button,
  component_menu,
  component_menu_options,
  component_menu_options_emoji,
  PARSE_MODE_NONE,
  PARSE_MODE_MARKDOWN,
  PARSE_MODE_EMOJI,
} from "../../ext/htmlGen.js";

class Component {
  static readonly styles: { [key: string]: string } = {
    Primary: "#5865F2",
    Secondary: "#4F545C",
    Success: "#2D7D46",
    Danger: "#D83C3E",
    Link: "#4F545C",
  };

  static menu_div_id = 0;
  static menus = "";

  component: ActionRow<MessageActionRowComponent>;
  guild: Guild;

  constructor(component: ActionRow<MessageActionRowComponent>, guild: Guild) {
    this.component = component;
    this.guild = guild;
  }

  async buildComponent(c: MessageActionRowComponent): Promise<string> {
    if (c instanceof ButtonComponent) {
      return this.buildButton(c);
    } else if (c instanceof StringSelectMenuComponent) {
      return this.buildMenu(c);
    }
    return "";
  }

  async buildButton(c: ButtonComponent): Promise<string> {
    if (c.data.style === ButtonStyle.Premium) return "";
    const { style, disabled, label = "", emoji = null } = c.data;
    const url = "url" in c.data ? c.data.url : null;

    // Validate style and ensure it's one of the expected types
    if (!Object.values(ButtonStyle).includes(style)) {
      throw new Error(`Invalid button style: ${style}`);
    }

    // Determine icon and emoji HTML
    const icon =
      style === ButtonStyle.Link && url
        ? DiscordUtils.button_external_link
        : "";
    const emojiHtml = emoji?.id
      ? `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.png" height="20px" width="20px" alt="${emoji.name}" />`
      : emoji?.name ?? "";

    // Generate button HTML using the fillOut function
    const buttonHtml = await fillOut(this.guild, component_button, [
      [
        "DISABLED",
        disabled ? "chatlog__component-disabled" : "",
        PARSE_MODE_NONE,
      ],
      ["URL", url ?? "", PARSE_MODE_NONE],
      ["LABEL", label, PARSE_MODE_MARKDOWN],
      ["EMOJI", emojiHtml, PARSE_MODE_EMOJI],
      ["ICON", icon, PARSE_MODE_NONE],
      ["STYLE", Component.styles[ButtonStyle[style]], PARSE_MODE_NONE],
    ]);

    return buttonHtml;
  }

  async buildMenu(c: StringSelectMenuComponent): Promise<string> {
    const { placeholder = "", options, disabled } = c.data;
    let content = "";

    if (!disabled) {
      content = await this.buildMenuOptions(options);
    }

    const menuHtml = await fillOut(this.guild, component_menu, [
      [
        "DISABLED",
        disabled ? "chatlog__component-disabled" : "",
        PARSE_MODE_NONE,
      ],
      ["ID", Component.menu_div_id.toString(), PARSE_MODE_NONE],
      ["PLACEHOLDER", placeholder.toString(), PARSE_MODE_MARKDOWN],
      ["CONTENT", content.toString(), PARSE_MODE_NONE],
      ["ICON", DiscordUtils.interaction_dropdown_icon, PARSE_MODE_NONE],
    ]);

    return menuHtml;
  }

  async buildMenuOptions(options?: APISelectMenuOption[]): Promise<string> {
    let content = "";
    if (!options) return content;
    for (const option of options) {
      if (option.emoji) {
        content += await fillOut(this.guild, component_menu_options_emoji, [
          ["EMOJI", option.emoji.toString(), PARSE_MODE_EMOJI],
          ["TITLE", option.label?.toString() ?? "", PARSE_MODE_MARKDOWN],
          [
            "DESCRIPTION",
            option.description ? option.description.toString() : "",
            PARSE_MODE_MARKDOWN,
          ],
        ]);
      } else {
        content += await fillOut(this.guild, component_menu_options, [
          ["TITLE", option.label?.toString() ?? "", PARSE_MODE_MARKDOWN],
          [
            "DESCRIPTION",
            option.description ? option.description.toString() : "",
            PARSE_MODE_MARKDOWN,
          ],
        ]);
      }
    }

    if (content) {
      content = `<div id="dropdownMenu${Component.menu_div_id}" class="dropdownContent">${content}</div>`;
    }

    return content;
  }

  async flow(): Promise<string> {
    let components = "";

    for (const c of this.component.components) {
      const componentHtml = await this.buildComponent(c);
      components += componentHtml;
    }

    let menus = "";
    let buttons = "";

    if (Component.menu_div_id > 0) {
      menus = `<div class="chatlog__components">${Component.menus}</div>`;
    }

    if (components) {
      buttons = `<div class="chatlog__components">${components}</div>`;
    }

    Component.menu_div_id = 0;

    return menus + buttons;
  }
}

export { Component };
