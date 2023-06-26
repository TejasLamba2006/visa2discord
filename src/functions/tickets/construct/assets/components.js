const Discord = require("discord.js");
const { DiscordUtils } = require("../../ext/discord_utils");
const {
  fillOut,
  component_button,
  component_menu,
  component_menu_options,
  component_menu_options_emoji,
  PARSE_MODE_NONE,
  PARSE_MODE_MARKDOWN,
  PARSE_MODE_EMOJI,
} = require("../../ext/html_gen.js");

class Component {
  static styles = {
    Primary: "#5865F2",
    Secondary: "#4F545C",
    Success: "#2D7D46",
    Danger: "#D83C3E",
    Link: "#4F545C",
  };

  constructor(component, guild) {
    this.component = component;
    this.guild = guild;
  }

  async buildComponent(c) {
    if (c instanceof Discord.ButtonComponent) {
      return this.buildButton(c);
    } else if (c instanceof Discord.StringSelectMenuBuilder) {
      return this.buildMenu(c);
    }
  }

  async buildButton(c) {
    const { url = "", label = "", style, disabled, emoji } = c.data;
    const icon = url ? DiscordUtils.button_external_link : "";
    const emojiHtml = emoji?.id
      ? `<img src="https://cdn.discordapp.com/emojis/${emoji.id}.png" height="20px" width="20px" alt="${emoji.name}" />`
      : emoji?.name || "";

    const buttonHtml = await fillOut(this.guild, component_button, [
      ["DISABLED", disabled ? "chatlog__component-disabled" : "", PARSE_MODE_NONE],
      ["URL", url.toString(), PARSE_MODE_NONE],
      ["LABEL", label, PARSE_MODE_MARKDOWN],
      ["EMOJI", emojiHtml, PARSE_MODE_EMOJI],
      ["ICON", icon.toString(), PARSE_MODE_NONE],
      ["STYLE", Component.styles[Discord.ButtonStyle[style]], PARSE_MODE_NONE],
    ]);

    return buttonHtml;
  }

  async buildMenu(c) {
    const { placeholder = "", options, disabled } = c;
    let content = "";

    if (!disabled) {
      content = await this.buildMenuOptions(options);
    }

    const menuHtml = await fillOut(this.guild, component_menu, [
      ["DISABLED", disabled ? "chatlog__component-disabled" : "", PARSE_MODE_NONE],
      ["ID", Component.menu_div_id.toString(), PARSE_MODE_NONE],
      ["PLACEHOLDER", placeholder.toString(), PARSE_MODE_MARKDOWN],
      ["CONTENT", content.toString(), PARSE_MODE_NONE],
      ["ICON", DiscordUtils.interaction_dropdown_icon, PARSE_MODE_NONE],
    ]);

    return menuHtml;
  }

  async buildMenuOptions(options) {
    let content = "";
    for (const option of options) {
      if (option.emoji) {
        content += await fillOut(this.guild, component_menu_options_emoji, [
          ["EMOJI", option.emoji.toString(), PARSE_MODE_EMOJI],
          ["TITLE", option.label.toString(), PARSE_MODE_MARKDOWN],
          ["DESCRIPTION", option.description ? option.description.toString() : "", PARSE_MODE_MARKDOWN],
        ]);
      } else {
        content += await fillOut(this.guild, component_menu_options, [
          ["TITLE", option.label.toString(), PARSE_MODE_MARKDOWN],
          ["DESCRIPTION", option.description ? option.description.toString() : "", PARSE_MODE_MARKDOWN],
        ]);
      }
    }

    if (content) {
      content = `<div id="dropdownMenu${Component.menu_div_id}" class="dropdownContent">${content}</div>`;
    }

    return content;
  }

  async flow() {
    let components = "";

    for (const c of this.component[0].components) {
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

module.exports = {
  Component,
};
