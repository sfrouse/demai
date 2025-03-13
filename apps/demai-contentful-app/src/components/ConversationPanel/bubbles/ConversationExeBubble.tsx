import tokens from "@contentful/f36-tokens";
import * as icons from "@contentful/f36-icons";
import { Button, Flex } from "@contentful/f36-components";
import {
  ChatMessage,
  ChatSession,
} from "../../../ai/_archive/chatSession/ChatSession";

const ConversationExeBubble = ({
  chatMessage,
  chatSession,
}: {
  chatMessage: ChatMessage | null | undefined;
  chatSession: ChatSession | null | undefined;
}) => {
  if (!chatMessage?.toolCalls) return null;

  return (
    <Flex
      style={{
        float: "right",
        clear: "both",
        gap: tokens.spacingS,
      }}
    >
      <Button onClick={async () => {}} variant="transparent">
        Nope, Cancel
      </Button>
      <Button
        startIcon={<icons.StarIcon />}
        onClick={async () => {
          if (chatMessage) {
            await chatSession?.execute(chatMessage);
          }
        }}
        variant="primary"
      >
        Yes, Execute
      </Button>
    </Flex>
  );
};

export default ConversationExeBubble;
