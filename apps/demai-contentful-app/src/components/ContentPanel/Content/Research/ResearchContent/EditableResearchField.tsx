import React, { useEffect, useState } from "react";
import { Button, Flex, IconButton, Textarea } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import * as icons from "@contentful/f36-icons";
import { ContentStateResearch } from "../../../../../contexts/ContentStateContext/ContentStateContext";
import convertMarkdown from "../../../../ConversationPanel/util/convertMarkdown";
import ContentSectionHeader from "../../../ContentSectionHeader/ContentSectionHeader";

type Props = {
  id: string;
  fieldInEditMode: string;
  setFieldInEditMode: React.Dispatch<React.SetStateAction<string>>;
  localResearch: ContentStateResearch | undefined;
  setLocalResearch: React.Dispatch<
    React.SetStateAction<ContentStateResearch | undefined>
  >;
  research: ContentStateResearch;
  isSaving: boolean;
  saveResearch: (id: string) => Promise<void>;
};

const EditableResearchField: React.FC<Props> = ({
  id,
  fieldInEditMode,
  setFieldInEditMode,
  localResearch,
  setLocalResearch,
  research,
  isSaving,
  saveResearch,
}) => {
  const [contentHTML, setContentHTML] = useState<string>("");
  const content = localResearch?.[id as keyof ContentStateResearch] || "";

  useEffect(() => {
    (async () => {
      const newHTML = convertMarkdown(`${content}`);
      setContentHTML(newHTML);
    })();
  }, [content]);

  const handleCancel = () => {
    setLocalResearch({
      ...localResearch,
      [id]: research[id as keyof ContentStateResearch],
    } as ContentStateResearch);
    setFieldInEditMode("");
  };

  const handleSave = async () => {
    await saveResearch(id);
  };

  // if (!content) return null;

  return (
    <Flex flexDirection="column" style={{ marginBottom: tokens.spacingL }}>
      <Flex justifyContent="space-between" alignItems="center">
        <ContentSectionHeader title={id} />
        <IconButton
          size="small"
          variant="transparent"
          icon={<icons.EditIcon />}
          aria-label={`Edit ${id.charAt(0).toUpperCase() + id.slice(1)}`}
          onClick={() => setFieldInEditMode(id === fieldInEditMode ? "" : id)}
        />
      </Flex>

      {id === fieldInEditMode ? (
        <Textarea
          style={{ height: 200 }}
          value={content}
          placeholder="Start typing..."
          onChange={(e) =>
            setLocalResearch({
              ...localResearch,
              [id]: e.target.value,
            } as ContentStateResearch)
          }
        />
      ) : (
        <div
          style={{ margin: 0 }}
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        ></div>
      )}

      {id === fieldInEditMode && (
        <Flex
          justifyContent="flex-end"
          style={{ marginTop: tokens.spacingS, gap: tokens.spacingS }}
        >
          <Button
            variant="secondary"
            onClick={handleCancel}
            isDisabled={isSaving}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
            Save
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default EditableResearchField;
