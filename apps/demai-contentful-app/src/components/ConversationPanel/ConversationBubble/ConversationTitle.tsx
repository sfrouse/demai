import { SectionHeading } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";

const ConversationTitle = ({ title }: { title: string }) => {
  return (
    // <div
    //   style={{
    //     fontSize: "1.15em",
    //     fontWeight: tokens.fontWeightMedium,
    //     marginBottom: 0,
    //   }}
    // >
    //   {title}
    // </div>
    <SectionHeading
      style={{
        margin: 0,
        color: tokens.blue500,
        fontSize: tokens.fontSizeSHigh,
        marginBottom: 4,
        textTransform: "uppercase",
      }}
    >
      {title}
    </SectionHeading>
  );
};

export default ConversationTitle;
