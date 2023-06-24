class Component {
    static styles = {
      primary: "#5865F2",
      secondary: "#4F545C",
      success: "#2D7D46",
      danger: "#D83C3E",
      blurple: "#5865F2",
      grey: "#4F545C",
      gray: "#4F545C",
      green: "#2D7D46",
      red: "#D83C3E",
      link: "#4F545C",
    };
  
    static components = "";
    static menus = "";
    static buttons = "";
    static menu_div_id = 0;
  
    constructor(component, guild) {
      this.component = component;
      this.guild = guild;
    }
  
    async buildComponent(c) {
      if (c instanceof Button) {
        await this.buildButton(c);
      } else if (c instanceof SelectMenu) {
        await this.buildMenu(c);
        Component.menu_div_id++;
      }
    }
  
    async buildButton(c) {
      const url = c.url || "";
      const label = c.label || "";
      const style = Component.styles[c.style.split(".")[1]];
      const icon = url ? DiscordUtils.button_external_link : "";
      const emoji = c.emoji ? c.emoji.toString() : "";
  
      Component.buttons += await fill_out(this.guild, component_button, [
        ["DISABLED", c.disabled ? "chatlog__component-disabled" : "", PARSE_MODE_NONE],
        ["URL", url.toString(), PARSE_MODE_NONE],
        ["LABEL", label.toString(), PARSE_MODE_MARKDOWN],
        ["EMOJI", emoji.toString(), PARSE_MODE_EMOJI],
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
  
      Component.menus += await fill_out(this.guild, component_menu, [
        ["DISABLED", c.disabled ? "chatlog__component-disabled" : "", PARSE_MODE_NONE],
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
          content += await fill_out(this.guild, component_menu_options_emoji, [
            ["EMOJI", option.emoji.toString(), PARSE_MODE_EMOJI],
            ["TITLE", option.label.toString(), PARSE_MODE_MARKDOWN],
            ["DESCRIPTION", option.description ? option.description.toString() : "", PARSE_MODE_MARKDOWN],
          ]);
        } else {
          content += await fill_out(this.guild, component_menu_options, [
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
      for (const c of this.component.children) {
        await this.buildComponent(c);
      }
  
      if (Component.menus) {
        Component.components += `<div class="chatlog__components">${Component.menus}</div>`;
      }
  
      if (Component.buttons) {
        Component.components += `<div class="chatlog__components">${Component.buttons}</div>`;
      }
  
      return Component.components;
    }
  }
  
module.exports = Component;