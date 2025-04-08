import { createClient } from "contentful-management";
import { ContentState } from "../../../contexts/ContentStateContext/ContentStateContext";
import { AIChainOutput, AIStateChain } from "../AIStateChain";
import { nanoid } from "nanoid";
import { DESIGN_SYSTEM_PREFIX } from "../../../constants";
import { CreateContentTypeEngine } from "../../AIPromptEngine/promptEngines/contentful/CreateContentTypeEngine";
import { CreateEntryEngine } from "../../AIPromptEngine/promptEngines/contentful/CreateEntryEngine";
import getContentTypes from "../../../contexts/ContentStateContext/services/getContentTypes";

export default class ContentfulAIChain extends AIStateChain {
  async run(contentState: ContentState) {
    super.run(contentState);

    await this.clear();
    await this.createSeveralContentTypes(
      contentState,
      this.outputs.createCTypesOutput
    );
    await this.createSeveralEntries(
      contentState,
      this.outputs.createEntriesOutput
    );
  }

  async clear() {
    // we are going to delete everything in there....
    // TODO: localize to just DemAI stuff...
    await this.deleteAllEntries(this.outputs.deleteEntriesOutput);
    await this.deleteAllCTypes(this.outputs.deleteCTypesOutput);
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
    output: AIChainOutput
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

    const results = await promptEngine.runAndExec(request, contentState);

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
    output: AIChainOutput
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
      console.log("request", request);
      const results = await promptEngine.runAndExec(request, contentState);
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

  async deleteAllEntries(output: AIChainOutput) {
    output.status = "running";
    const client = createClient({
      accessToken: this.config.cma,
    });
    const space = await client.getSpace(this.config.spaceId);
    const env = await space.getEnvironment(this.config.environmentId);

    const entries = await env.getEntries({ limit: 1000 }); // max limit
    let total = 0;
    for (const entry of entries.items) {
      console.log("entry.sys", entry.sys.id);
      const contentTypeId = entry.sys.contentType.sys.id;
      if (contentTypeId.indexOf(`${DESIGN_SYSTEM_PREFIX}-`) !== 0) {
        if (!entry.isPublished()) {
          await entry.delete();
        } else {
          await entry.unpublish();
          await entry.delete();
        }
        console.log(`Deleted entry: ${entry.sys.id}`);
        total = total + 1;
      }
    }
    output.content = `Deleted ${total} entries`;
    output.status = "done";
    this.updateOutput();
    this.setInvalidated((prev) => prev + 1);
  }

  // CAREFULL!!!!!
  async deleteAllCTypes(output: AIChainOutput) {
    output.status = "running";
    const client = createClient({
      accessToken: this.config.cma,
    });
    const space = await client.getSpace(this.config.spaceId);
    const env = await space.getEnvironment(this.config.environmentId);

    const contentTypes = await env.getContentTypes({ limit: 1000 });

    let total = 0;
    for (const contentType of contentTypes.items) {
      if (contentType.sys.id.indexOf(`${DESIGN_SYSTEM_PREFIX}-`) !== 0) {
        if (!contentType.isPublished()) {
          await contentType.delete();
        } else {
          await contentType.unpublish();
          await contentType.delete();
        }
        console.log(`Deleted content type: ${contentType.sys.id}`);
        total = total + 1;
      }
    }
    output.content = `Deleted ${total} Content Types`;
    output.status = "done";
    this.updateOutput();
    this.setInvalidated((prev) => prev + 1);
  }

  updateOutput() {
    this.setAIChainOutput([
      this.outputs.deleteEntriesOutput,
      this.outputs.deleteCTypesOutput,
      this.outputs.createCTypesOutput,
      this.outputs.createEntriesOutput,
    ]);
  }
}
