const IGNORED_CHARACTERS = [" ", "\n", "\t", "\r"];
const TERMINATION_CHARACTERS = [",", "]", "}"];

export default class JsonAssembler {
  private text_manager: JsonTextManager;
  constructor(input_json_text: string) {
    this.text_manager = new JsonTextManager(input_json_text);
  }

  public buildValue = (): any => {
    const char = this.text_manager.nextChar({ skip: IGNORED_CHARACTERS });
    switch (char) {
      case "}":
        return;
      case "]":
        return;
      case '"':
        return this.buildString();
      case "{":
        return this.buildObject();
      case "[":
        return this.buildArray();
      default:
        if (char) return this.buildPrimitive(char);
    }
  };

  public buildString = (): string => {
    let output_string = "";

    let char = this.text_manager.nextChar();
    let prev_char = null;
    while (char) {
      if (char === '"' && prev_char !== "\\") {
        break;
      } else {
        output_string += char;
      }
      prev_char = char;
      char = this.text_manager.nextChar();
    }

    return this.modifySpecialCharacters(output_string);
  };

  public modifySpecialCharacters = (text: string) =>
    text
      .replace(/\\n/g, "\n")
      .replace(/\\b/g, "\b")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\f/g, "\f")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

  public buildArray = (): any[] => {
    const output_array = [];

    let char = this.text_manager.nextChar({ skip: IGNORED_CHARACTERS });
    while (char && char != "]") {
      this.text_manager.returnChar(char);
      const value = this.buildValue();
      output_array.push(value);

      char = this.text_manager.nextChar({
        skip: [",", ...IGNORED_CHARACTERS],
      });
    }

    return output_array;
  };

  public buildObject = (): {} => {
    const output_obj: Record<string, any> = {};
    let char = this.text_manager.nextChar({ skip: IGNORED_CHARACTERS });

    while (char && char != "}") {
      if (char == '"') {
        const key = this.buildString();
        this.text_manager.nextChar({ until: [":"] });
        const value = this.buildValue();
        output_obj[key] = value;
      }
      char = this.text_manager.nextChar({ skip: IGNORED_CHARACTERS });
    }

    return output_obj;
  };

  public buildPrimitive = (char: string | null): any => {
    let output_primitive = char;
    char = this.text_manager.nextChar();
    while (char) {
      if (char && TERMINATION_CHARACTERS.includes(char)) {
        this.text_manager.returnChar(char);
        break;
      }

      output_primitive += char;
      char = this.text_manager.nextChar();
    }

    if (!output_primitive) return output_primitive;

    const num = parseFloat(output_primitive);
    if (!isNaN(num)) {
      return num;
    }

    if (output_primitive === "true") return true;
    if (output_primitive === "false") return false;
    if (output_primitive === "null") return null;
    if (output_primitive === "undefined") return undefined;

    return output_primitive;
  };

  public assemble = () => this.buildValue();
}

class JsonTextManager {
  private json_text: string;
  constructor(input_json_text: string) {
    this.json_text = input_json_text;
  }

  public nextChar = (options?: {
    until?: Array<string>;
    skip?: Array<string>;
  }) => {
    if (this.json_text.length == 0) return null;

    let index = 0;
    let char: string | null = this.json_text.charAt(index++);
    if (options?.until) {
      while (char && !options.until.includes(char)) {
        char =
          index < this.json_text.length ? this.json_text.charAt(index++) : null;
      }
    } else if (options?.skip) {
      while (char && options.skip.includes(char))
        char =
          index < this.json_text.length ? this.json_text.charAt(index++) : null;
    }

    this.json_text = this.json_text.slice(index, this.json_text.length);
    return char;
  };

  public returnChar(char: string) {
    this.json_text = char + this.json_text;
  }
}
