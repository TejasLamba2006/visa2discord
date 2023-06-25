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

  static components = "";
  static menu_div_id = 0;

  constructor(component, guild) {
    this.component = component;
    this.guild = guild;
  }

  async buildComponent(c) {
    if (c instanceof Discord.ButtonComponent) {
      await this.buildButton(c);
    } else if (c instanceof Discord.StringSelectMenuBuilder) {
      await this.buildMenu(c);
      Component.menu_div_id++;
    }
  }

  async buildButton(c) {
    c = c.data;
    const url = c.url || "";
    const label = c.label || "";
    const style = Component.styles[Discord.ButtonStyle[c.style]];
    const icon = url ? DiscordUtils.button_external_link : "";
    const emoji = c.emoji?.id
      ? `<img src="https://cdn.discordapp.com/emojis/${c.emoji.id}.png" height="20px" width="20px" alt="${c.emoji.name}" />`
      : c.emoji?.name || "";

    Component.components += await fillOut(this.guild, component_button, [
      [
        "DISABLED",
        c.disabled ? "chatlog__component-disabled" : "",
        PARSE_MODE_NONE,
      ],
      ["URL", url.toString(), PARSE_MODE_NONE],
      ["LABEL", label, PARSE_MODE_MARKDOWN],
      ["EMOJI", emoji, PARSE_MODE_EMOJI],
      ["ICON", icon.toString(), PARSE_MODE_NONE],
      ["STYLE", style, PARSE_MODE_NONE],
    ]);
  }

  async buildMenu(c) {
    const placeholder = c.placeholder || "";
    const options = c.options;
    let content = "";

    if (!c.disabled) {
      content = await this.buildMenuOptions(options);
    }

    Component.components += await fillOut(this.guild, component_menu, [
      [
        "DISABLED",
        c.disabled ? "chatlog__component-disabled" : "",
        PARSE_MODE_NONE,
      ],
      ["ID", Component.menu_div_id.toString(), PARSE_MODE_NONE],
      ["PLACEHOLDER", placeholder.toString(), PARSE_MODE_MARKDOWN],
      ["CONTENT", content.toString(), PARSE_MODE_NONE],
      ["ICON", DiscordUtils.interaction_dropdown_icon, PARSE_MODE_NONE],
    ]);
  }

  async buildMenuOptions(options) {
    let content = "";
    for (const option of options) {
      if (option.emoji) {
        content += await fillOut(this.guild, component_menu_options_emoji, [
          ["EMOJI", option.emoji.toString(), PARSE_MODE_EMOJI],
          ["TITLE", option.label.toString(), PARSE_MODE_MARKDOWN],
          [
            "DESCRIPTION",
            option.description ? option.description.toString() : "",
            PARSE_MODE_MARKDOWN,
          ],
        ]);
      } else {
        content += await fillOut(this.guild, component_menu_options, [
          ["TITLE", option.label.toString(), PARSE_MODE_MARKDOWN],
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

  async flow() {
    for (const c of this.component.components) {
      await this.buildComponent(c);
    }

    return Component.components;
  }
}

module.exports = {
  Component,
};
