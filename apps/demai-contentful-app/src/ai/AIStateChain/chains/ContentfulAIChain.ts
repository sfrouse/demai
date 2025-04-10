import { createClient } from "contentful-management";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AIChainOutput, AIStateChain } from "../AIStateChain";
import { nanoid } from "nanoid";
import {
  DEMAI_GENERATED_PROPERTY_IDENTIFIER,
  DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
} from "../../../constants";
import { CreateContentTypeEngine } from "../../AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { CreateEntryEngine } from "../../AIPromptEngine/promptEngines/contentful/CreateEntryEngine";
import getContentTypes from "../../../contexts/ContentStateContext/services/getContentTypes";
import { AppError } from "../../../contexts/ErrorContext/ErrorContext";

export default class ContentfulAIChain extends AIStateChain {
  chainOutput: AIChainOutput[] = [];

  async run(contentState: ContentState, addError: (err: AppError) => void) {
    super.run(contentState, addError);

    await this.clearGeneratedContent(addError);

    this.chainOutput = [
      this.outputs.deleteEntriesOutput,
      this.outputs.deleteCTypesOutput,
      this.outputs.createCTypesOutput,
      this.outputs.createEntriesOutput,
    ];
    await this.createSeveralContentTypes(
      contentState,
      this.outputs.createCTypesOutput,
      addError
    );
    await this.createSeveralEntries(
      contentState,
      this.outputs.createEntriesOutput,
      addError
    );
  }

  async clearGeneratedContent(addError: (err: AppError) => void) {
    this.chainOutput = [
      this.outputs.deleteEntriesOutput,
      this.outputs.deleteCTypesOutput,
    ];
    await this.deleteAllCTypes(
      DEMAI_GENERATED_PROPERTY_IDENTIFIER,
      this.outputs.deleteCTypesOutput,
      this.outputs.deleteEntriesOutput,
      addError
    );
  }

  async clearSystemContent(addError: (err: AppError) => void) {
    this.chainOutput = [
      this.outputs.deleteEntriesOutput,
      this.outputs.deleteCTypesOutput,
    ];
    await this.deleteAllCTypes(
      DEMAI_SYSTEM_PROPERTY_IDENTIFIER,
      this.outputs.deleteCTypesOutput,
      this.outputs.deleteEntriesOutput,
      addError
    );
  }

  outputs: { [key: string]: AIChainOutput } = {
    deleteCTypesOutput: {
      key: nanoid(),
      name: "Contentful - Delete Content Types",
      content: "",
      status: "initialized",
    },
    deleteEntriesOutput: {
      key: nanoid(),
      name: "Contentful - Delete Entries",
      content: "",
      status: "initialized",
    },
    createCTypesOutput: {
      key: nanoid(),
      name: "Contentful - Generating Content Types",
      content: "",
      status: "initialized",
    },
    createEntriesOutput: {
      key: nanoid(),
      name: "Contentful - Generating Entries",
      content: "",
      status: "initialized",
    },
  };

  async createSeveralContentTypes(
    contentState: ContentState,
    output: AIChainOutput,
    addError: (err: AppError) => void
  ) {
    const totalNewCTypes = "3";
    const promptEngine = new CreateContentTypeEngine(this.config);
    const contextDefaults =
      promptEngine.getContextContentSelectionDefaults(contentState);

    contextDefaults[CreateContentTypeEngine.ACTION_CREATE_CTYPES_ID] =
      totalNewCTypes;
    output.status = "running";
    this.updateOutput();
    const request = promptEngine.createRequest(
      "",
      contextDefaults,
      contentState
    );

    const results = await promptEngine.runAndExec(
      request,
      contentState,
      addError
    );

    if (results.success) {
      output.content = `Created ${totalNewCTypes} Content Types`;
      output.status = "done";
    } else {
      output.errors = results.errors;
      output.status = "error";
    }

    this.updateOutput();
    this.setInvalidated((prev) => prev + 1);
  }

  async createSeveralEntries(
    contentState: ContentState,
    output: AIChainOutput,
    addError: (err: AppError) => void
  ) {
    const totalNewEntries = "2";
    const promptEngine = new CreateEntryEngine(this.config);
    const contextDefaults =
      promptEngine.getContextContentSelectionDefaults(contentState);

    contextDefaults[CreateEntryEngine.CONTEXT_NUMBER_OF_TYPES] =
      totalNewEntries;
    output.status = "running";
    this.updateOutput();

    contentState.contentTypes = await getContentTypes(this.config);

    const tasks = contentState.contentTypes.map(async (ctype) => {
      const localDefaults = {
        ...contextDefaults,
        [CreateEntryEngine.CONTEXT_CTYPE_ID]: ctype.sys.id,
      };
      const request = promptEngine.createRequest(
        "",
        localDefaults,
        contentState
      );
      const results = await promptEngine.runAndExec(
        request,
        contentState,
        addError
      );
      return results;
    });

    const allResults = await Promise.all(tasks);

    let newEntryCount = 0;
    for (const result of allResults) {
      newEntryCount += parseInt(totalNewEntries);
      if (!result.success) {
        output.errors = [...(output.errors || []), ...result.errors];
      }
    }

    output.content = `Created ${newEntryCount} Entries`;
    output.status =
      output.errors && output.errors.length > 0 ? "error" : "done";
    this.updateOutput();
    this.setInvalidated((prev) => prev + 1);
  }

  // CAREFULL!!!!!
  async deleteAllCTypes(
    ctypeIdentifier: string,
    output: AIChainOutput,
    entryOutput: AIChainOutput,
    addError: (err: AppError) => void
  ) {
    try {
      output.status = "running";
      const client = createClient({
        accessToken: this.config.cma,
      });
      const space = await client.getSpace(this.config.spaceId);
      const env = await space.getEnvironment(this.config.environmentId);

      const contentTypes = await env.getContentTypes({ limit: 1000 });

      let total = 0;
      let totalEntries = 0;
      for (const contentType of contentTypes.items) {
        // if (contentType.sys.id.indexOf(`${DESIGN_SYSTEM_PREFIX}-`) !== 0) {
        const demaiPropIdentifier = contentType.fields.find(
          (field) => field.id === ctypeIdentifier
        );
        if (demaiPropIdentifier) {
          totalEntries = await this.deleteAllEntriesByContentType(
            contentType.sys.id,
            entryOutput,
            addError,
            totalEntries
          );
          if (!contentType.isPublished()) {
            await contentType.delete();
          } else {
            await contentType.unpublish();
            await contentType.delete();
          }
          console.log(
            `Deleted content type: ${contentType.sys.id}`,
            contentType
          );
          total = total + 1;
        }
      }
      output.content = `Deleted ${total} Content Types`;
      output.status = "done";
      entryOutput.content = `Deleted ${totalEntries} entries`;
      entryOutput.status = "done";
      this.updateOutput();
      this.setInvalidated((prev) => prev + 1);
    } catch (err) {
      addError({
        service: "Deleting all DemAI Entries",
        message: "Error trying to delete entries related to DemAI",
        details: `${err}`,
      });
    }
  }

  // CAREFULL !!!!
  async deleteAllEntriesByContentType(
    contentTypeIdToDelete: string,
    output: AIChainOutput,
    addError: (err: AppError) => void,
    totalDeleted: number = 0
  ) {
    let total = totalDeleted;
    try {
      output.status = "running";
      const client = createClient({
        accessToken: this.config.cma,
      });
      const space = await client.getSpace(this.config.spaceId);
      const env = await space.getEnvironment(this.config.environmentId);

      const entries = await env.getEntries({
        content_type: contentTypeIdToDelete,
        limit: 1000,
      });

      for (const entry of entries.items) {
        try {
          if (entry.isPublished()) {
            await entry.unpublish();
          }
          await entry.delete();
          console.log(`Deleted entry: ${entry.sys.id}`);
          total += 1;
        } catch (entryErr) {
          addError({
            message: `Failed to delete entry ${entry.sys.id}`,
            service: "Delete Entry",
            details: entryErr,
          });
        }
      }

      // output.content = `Deleted ${total} entries of content type "${contentTypeIdToDelete}"`;
      // output.status = "done";
      this.updateOutput();
      this.setInvalidated((prev) => prev + 1);
    } catch (err) {
      addError({
        service: "Deleting Entries by Content Type",
        message: "Failed to delete entries",
        details: `${err}`,
      });
    }
    return total;
  }

  updateOutput() {
    this.setAIChainOutput([...this.chainOutput]);
  }
}
