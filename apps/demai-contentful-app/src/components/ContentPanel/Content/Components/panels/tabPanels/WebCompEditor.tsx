import React, { useEffect, useState } from "react";
import { Select, TextInput } from "@contentful/f36-components";

type Schema = {
  "x-cdef": { tag: string };
  properties: {
    [key: string]: {
      type?: string | string[];
      title?: string;
      enum?: string[];
      "x-cdef"?: {
        input?: {
          options?: Record<string, string>;
          defaultValue?: string;
        };
        output?: {
          webComponent?: {
            attribute?: string;
          };
        };
      };
    };
  };
};

export function WebCompEditor(props: {
  schema: Schema;
  onChange: (params: Record<string, any>) => void;
}): JSX.Element | null {
  const { schema, onChange } = props;

  const defaultParams: { [key: string]: any } = {};
  Object.entries(schema?.properties).map(([key, value]) => {
    const input = value["x-cdef"]?.input;
    const defaultVal = input?.defaultValue;
    defaultParams[key] = defaultVal || `Example ${key}`;
  });
  const [params, setParams] = useState<Record<string, any>>(defaultParams);

  if (!schema) return null;
  const properties = schema.properties;
  const filterOutProps: string[] = []; // ["disabled"];

  useEffect(() => {
    onChange(params);
  }, [params]);

  const rows = Object.entries(properties)
    .filter(
      ([_, value]) =>
        !filterOutProps.includes(
          value?.["x-cdef"]?.output?.webComponent?.attribute ?? ""
        )
    )
    .map(([key, value]) => {
      const attrName = value["x-cdef"]?.output?.webComponent?.attribute;
      if (!attrName) return null;

      const input = value["x-cdef"]?.input;
      const options = input?.options;
      const label = value.title || key;

      let field: JSX.Element;

      // <select> for enum
      if (options && Object.keys(options).length > 0) {
        field = (
          <Select
            value={params[key]}
            onChange={(e) => {
              setParams({
                ...params,
                [key]: e.target.value,
              });
              console.log(key, e.target.value);
            }}
          >
            {Object.entries(options).map(([optLabel, optValue]) => (
              <Select.Option key={`${label}-${optValue}`} value={optValue}>
                {optLabel}
              </Select.Option>
            ))}
          </Select>
        );
      }

      // <input> for string
      else if (value.type === "string") {
        const value = params[key];
        field = (
          <TextInput
            value={value}
            name={attrName}
            onChange={(e) => {
              setParams({
                ...params,
                [key]: e.target.value,
              });
              console.log(key, e.target.value);
            }}
          />
        );
      }

      // <input> for string
      else if (value.type === "boolean") {
        field = (
          <Select
            name="optionSelect-controlled"
            value={params[key]}
            onChange={(e) => {
              setParams({
                ...params,
                [key]: e.target.value,
              });
              console.log(key, e.target.value);
            }}
          >
            <Select.Option key={`${label}-true`} value={"true"}>
              true
            </Select.Option>
            <Select.Option key={`${label}-false`} value={"false"}>
              false
            </Select.Option>
          </Select>
        );
      }

      // <input> for arrays (comma-separated string)
      else if (value.type === "array") {
        field = (
          <TextInput
            value={params[key]}
            name={attrName}
            placeholder="comma,separated,values"
            onChange={(e) => {
              setParams({
                ...params,
                [key]: e.target.value,
              });
              console.log(key, e.target.value);
            }}
          />
        );
      } else {
        return null; // skip unsupported
      }

      return (
        <tr key={key}>
          <td>
            <strong>{label}</strong>
          </td>
          <td style={{ padding: 2 }}>{field}</td>
        </tr>
      );
    });

  return (
    <form onSubmit={(e) => console.log(params)}>
      <table>
        <tbody>{rows.filter(Boolean)}</tbody>
      </table>
    </form>
  );
}
