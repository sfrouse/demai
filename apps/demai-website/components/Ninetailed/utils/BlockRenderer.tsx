// import { singularOrArrayBlock } from "./parseExperiences";

export const BlockRenderer = (props: any) => {
  let other = "other";
  if (props?.fields?.simpleIdea && props?.fields?.simpleIdea.length > 0) {
    other = props?.fields?.simpleIdea[0].fields.title;
  }
  return (
    <div>
      BLOCK| {props?.sys?.id} / {props?.fields?.title} |BLOCK
      {other}
    </div>
  );
};
