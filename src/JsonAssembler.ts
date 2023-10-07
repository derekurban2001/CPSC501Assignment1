const WHITE_SPACES = [" ", "\n", "\t", "\r"];
const CLOSURES = [",", "]", "}"];

export default class JsonAssembler {
  private string_manager: JsonStringManager;
  constructor(json_string: string) {
    this.string_manager = new JsonStringManager(json_string);
  }

  public assembleValue = (): any => {
    const char = this.string_manager.nextChar({ skip: WHITE_SPACES });
    switch (char) {
      case "}":
        return;
      case "]":
        return;
      case '"':
        return this.assembleString();
      case "{":
        const obj = this.assembleObject();
        return obj;
      case "[":
        return this.assembleArray();
      default:
        if (char) return this.assemblePrimitive(char);
    }
  };

  public assembleString = (): string => {
    let result = "";

    let char = this.string_manager.nextChar();
    let prev_char = null;
    while (char) {
      if (char === '"' && prev_char !== "\\") {
        break;
      } else {
        result += char;
      }
      prev_char = char;
      char = this.string_manager.nextChar();
    }

    return this.replaceSpecialChars(result);
  };

  public replaceSpecialChars = (text: string) =>
    text
      .replace(/\\n/g, "\n")
      .replace(/\\b/g, "\b")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\f/g, "\f")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

  public assembleArray = (): any[] => {
    const arr = [];

    let char = this.string_manager.nextChar({ skip: WHITE_SPACES });
    while (char && char != "]") {
      this.string_manager.returnChar(char);
      const value = this.assembleValue();
      arr.push(value);

      char = this.string_manager.nextChar({ skip: [",", ...WHITE_SPACES] });
    }

    return arr;
  };

  public assembleObject = (): {} => {
    const obj: Record<string, any> = {};
    let char = this.string_manager.nextChar({ skip: WHITE_SPACES });

    while (char && char != "}") {
      if (char == '"') {
        const key = this.assembleString();
        this.string_manager.nextChar({ until: [":"] });
        const value = this.assembleValue();
        obj[key] = value;
      }
      char = this.string_manager.nextChar({ skip: WHITE_SPACES });
    }

    return obj;
  };

  public assemblePrimitive = (char: string | null): any => {
    let result = char;
    char = this.string_manager.nextChar();
    while (char) {
      if (char && CLOSURES.includes(char)) {
        this.string_manager.returnChar(char);
        break;
      }

      result += char;
      char = this.string_manager.nextChar();
    }

    if (!result) return result;

    const num = parseFloat(result);
    if (!isNaN(num)) {
      return num;
    }

    if (result === "true") return true;
    if (result === "false") return false;
    if (result === "null") return null;
    if (result === "undefined") return undefined;

    return result;
  };

  public assemble = () => this.assembleValue();
}

class JsonStringManager {
  private json_string: string;
  constructor(json_string: string) {
    this.json_string = json_string;
  }

  public nextChar = (options?: {
    until?: Array<string>;
    skip?: Array<string>;
  }) => {
    if (this.json_string.length == 0) return null;

    let index = 0;
    let char: string | null = this.json_string.charAt(index++);
    if (options?.until) {
      while (char && !options.until.includes(char)) {
        char =
          index < this.json_string.length
            ? this.json_string.charAt(index++)
            : null;
      }
    } else if (options?.skip) {
      while (char && options.skip.includes(char))
        char =
          index < this.json_string.length
            ? this.json_string.charAt(index++)
            : null;
    }

    this.json_string = this.json_string.slice(index, this.json_string.length);
    return char;
  };

  public returnChar(char: string) {
    this.json_string = char + this.json_string;
  }
}
