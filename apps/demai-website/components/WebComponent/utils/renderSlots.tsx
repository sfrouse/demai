import { Entry } from "contentful";
import isObject from "./isObject";
import { SpaceParams } from "@/app/types";
import ComponentRenderer from "@/components/ComponentRenderer/ComponentRenderer";

export default function renderSlots(
  entry: Entry<any>,
  config: any,
  params: SpaceParams,
  children: any[] = []
) {
  if (!config.mappings) return children;

  const entryContentTypeId = entry.sys.contentType.sys.id;
  Object.entries(entry.fields).forEach(([entryPropName, entryValue]) => {
    const mapName = `${entryContentTypeId}.${entryPropName}`;
    const mapValue = config.mappings[mapName];

    if (mapValue?.slot) {
      if (Array.isArray(entryValue)) {
        const subChildren: any[] = [];
        entryValue.map((entryValueChild) => {
          subChildren.push(
            <ComponentRenderer
              key={`wc-${entry.sys.id}-${entryValueChild.sys.id}`}
              entry={entryValueChild}
              params={params}
            />
          );
        });
        children.push(
          <div
            key={`wc-${entry.sys.id}-${mapValue.slot}`}
            slot={mapValue.slot === "default" ? undefined : mapValue.slot}
          >
            {subChildren}
          </div>
        );
      } else if (isObject(entryValue)) {
        children.push(
          <div
            key={`wc-${entry.sys.id}-${mapValue.slot}`}
            slot={mapValue.slot === "default" ? undefined : mapValue.slot}
          >
            <ComponentRenderer
              key={`wc-${entry.sys.id}-${entryValue.sys.id}`}
              entry={entryValue}
              params={params}
            />
          </div>
        );
      }
    }
  });

  return children;
}
