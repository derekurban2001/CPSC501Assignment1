export default function jsonAssemble(json_string: string) {
  const nextChar = (options?: {
    until?: Array<string>;
    skip?: Array<string>;
  }) => {
    if (json_string.length == 0) return null;

    let index = 0;
    let char: string | null = json_string.charAt(index++);
    if (options?.until) {
      while (char && !options.until.includes(char)) {
        char = index < json_string.length ? json_string.charAt(index++) : null;
      }
    } else if (options?.skip) {
      while (char && options.skip.includes(char))
        char = index < json_string.length ? json_string.charAt(index++) : null;
    }

    json_string = json_string.slice(index, json_string.length);
    return char;
  };

  const assembleValue = (): any => {
    const char = nextChar({ skip: [" ", "\n", "\t", "\r"] });
    switch (char) {
      case "}":
        return;
      case "]":
        return;
      case '"':
        return assembleString();
      case "{":
        const obj = assembleObject();
        return obj;
      case "[":
        return assembleArray();
      default:
        if (char) return assemblePrimitive(char);
    }
  };

  const assembleString = (): string => {
    let result = "";

    let char = nextChar();
    let prev_char = null;
    while (char) {
      if (char === '"' && prev_char !== "\\") {
        break;
      } else {
        result += char;
      }
      prev_char = char;
      char = nextChar();
    }

    return replaceSpecialChars(result);
  };

  const replaceSpecialChars = (text: string) =>
    text
      .replace(/\\n/g, "\n")
      .replace(/\\b/g, "\b")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\f/g, "\f")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

  const assembleArray = (): any[] => {
    const arr = [];

    let char = nextChar({ skip: [" ", "\n", "\t", "\r"] });
    while (char && char != "]") {
      json_string = char + json_string;
      const value = assembleValue();
      arr.push(value);

      char = nextChar({ skip: [",", ...[" ", "\n", "\t", "\r"]] });
    }

    return arr;
  };

  const assembleObject = (): {} => {
    const obj: Record<string, any> = {};
    let char = nextChar({ skip: [" ", "\n", "\t", "\r"] });

    while (char && char != "}") {
      if (char == '"') {
        const key = assembleString();
        nextChar({ until: [":"] });
        const value = assembleValue();
        obj[key] = value;
      }
      char = nextChar({ skip: [" ", "\n", "\t", "\r"] });
    }

    return obj;
  };

  const assemblePrimitive = (char: string | null): any => {
    let result = char;
    char = nextChar();
    while (char) {
      if (char && [",", "]", "}"].includes(char)) {
        json_string = char + json_string;
        break;
      }

      result += char;
      char = nextChar();
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

  return assembleValue();
}
