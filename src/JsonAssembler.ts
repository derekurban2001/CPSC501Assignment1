// Define ignored and termination characters

const IGNORED_CHARACTERS = [" ", "\n", "\t", "\r"];

const TERMINATION_CHARACTERS = [",", "]", "}"];

// This class assembles the JSON

export default class JsonAssembler {
  // Declare JsonTextManager

  private text_manager: JsonTextManager;

  // Initialize JsonAssembler with input JSON text

  constructor(input_json_text: string) {
    this.text_manager = new JsonTextManager(input_json_text);
  }

  // Method to build a value from JSON text

  public buildValue = (): any => {
    // Get the next character out of the ignored characters

    const char = this.text_manager.nextChar({ skip: IGNORED_CHARACTERS });

    // Analyze the character and build corresponding string, object, array or primitive

    switch (char) {
      case "}": // handle for '}' character
        return;

      case "]": // handle for ']' character
        return;

      case '"': // If character is string, build string
        return this.buildString();

      case "{": // If character is object, build object
        return this.buildObject();

      case "[": // If character is array, build array
        return this.buildArray();

      default:
        // If character is other type, build primitive

        if (char) return this.buildPrimitive(char);
    }
  };

  // Method to build a string value

  public buildString = (): string => {
    let output_string = "";

    // Get the next characters and append them to the output_string until find '"' character

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

  // Method to replace special characters to their actual representation

  public modifySpecialCharacters = (text: string) =>
    text

      .replace(/\\n/g, "\n")

      .replace(/\\b/g, "\b")

      .replace(/\\r/g, "\r")

      .replace(/\\t/g, "\t")

      .replace(/\\f/g, "\f")

      .replace(/\\"/g, '"')

      .replace(/\\\\/g, "\\");

  // Method to build an array value

  public buildArray = (): any[] => {
    const output_array = [];

    // Parsing the array characters from JSON text and append them into output_array

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

  // Method to build an object value

  public buildObject = (): {} => {
    const output_obj: Record<string, any> = {};

    // Parsing the object fields from JSON text and append them into the output object

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

  // Method to build a primitive value

  public buildPrimitive = (char: string | null): any => {
    let output_primitive = char;

    // Parse the primitive from JSON text

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

    // Convert output_primitive to corresponding types (number, boolean, null, undefined)

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

  // Entry method to start building JSON from text

  public assemble = () => this.buildValue();
}

// This class manages the JSON text

class JsonTextManager {
  private json_text: string;

  // Initialize JsonTextManager with input JSON text

  constructor(input_json_text: string) {
    this.json_text = input_json_text;
  }

  // Method to get next character with some options like 'until' and 'skip'

  public nextChar = (options?: {
    until?: Array<string>;

    skip?: Array<string>;
  }) => {
    // If text is empty, return null

    if (this.json_text.length == 0) return null;

    let index = 0;

    let char: string | null = this.json_text.charAt(index++);

    // Iterate until find character or end of text

    if (options?.until) {
      while (char && !options.until.includes(char)) {
        char =
          index < this.json_text.length ? this.json_text.charAt(index++) : null;
      }
    } else if (options?.skip) {
      // Skip characters which are included in 'skip' option

      while (char && options.skip.includes(char))
        char =
          index < this.json_text.length ? this.json_text.charAt(index++) : null;
    }

    // remove processed characters in json_text

    this.json_text = this.json_text.slice(index, this.json_text.length);

    return char;
  };

  // Method to return the character to json_text

  public returnChar(char: string) {
    this.json_text = char + this.json_text;
  }
}
