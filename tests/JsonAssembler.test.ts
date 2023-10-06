import { describe, test } from "vitest";
import JsonAssemble from "../src/JsonAssembler";

describe("Tests for JsonAssembler", () => {
  test("Nested Objects and Arrays Test", ({ expect }) => {
    const test_json = {
      obj_key: {
        nested_obj: {
          int_key: 109,
          bool_key: false,
          null_key: null,
        },
        arr_key: [1, 2, "three"],
      },
      arr_key: [
        "first",
        2,
        {
          nested_obj: {
            str_key: "nested",
          },
        },
        [],
        [1, 2, 3],
      ],
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Array Of Primitive Types Test", ({ expect }) => {
    const test_json = [1, "string", false, null];

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Empty Object Test", ({ expect }) => {
    const test_json = {};

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Empty Array Test", ({ expect }) => {
    const test_json = [];

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Test With Undefined Value", ({ expect }) => {
    const test_json = {
      str_key: "string",
      undef_key: undefined,
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Values as Empty Objects Test", ({ expect }) => {
    const test_json = {
      obj_key1: {},
      obj_key2: {},
      obj_key3: {},
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Values as Nested Arrays Test", ({ expect }) => {
    const test_json = {
      arr_key: [[[]], [1, 2, [3, 4, [5]]], []],
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Values as Different Type of Primitives", ({ expect }) => {
    const test_json = {
      str_key: "string",
      num_key: 100,
      bool_key: false,
      null_key: null,
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Nested Objects Inside Arrays", ({ expect }) => {
    const test_json = [
      {
        id: 1,
        name: "John Doe",
      },
      {
        id: 2,
        name: "Jane Doe",
      },
    ];

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Test With Special Strings", ({ expect }) => {
    const test_json = {
      special_str_key1: "\\Test",
      special_str_key2: "Line \n Break",
      special_str_key3: "\b\f\n\r\t",
      special_str_key4: "\"Double quotes\" and 'Single quotes'",
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Mixed Primitive Types In Array", ({ expect }) => {
    const test_json = ["String", 28, true, null];

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Multiple Nested Objects", ({ expect }) => {
    const test_json = {
      level1: {
        level2: {
          level3: {
            level4: "End",
          },
        },
      },
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Number Keys Test", ({ expect }) => {
    const test_json = {
      1: "Number One",
      2: "Number Two",
      3: "Number Three",
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("Unicode String Test", ({ expect }) => {
    const test_json = {
      unicode_str_key: "Test\u00DCnicode",
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });

  test("String Keys Test", ({ expect }) => {
    const test_json = {
      "key one": "value one",
      "key two": "value two",
      "key three": "value three",
    };

    const final_obj = JsonAssemble(JSON.stringify(test_json));

    expect(final_obj).toEqual(test_json);
  });
});
