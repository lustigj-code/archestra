/**
 * OpenRouter Type Definitions
 *
 * OpenRouter provides a unified API for accessing multiple LLM providers.
 * It uses an OpenAI-compatible API format.
 * See: https://openrouter.ai/docs/quickstart
 */
import type OpenAIProvider from "openai";
import type { z } from "zod";
import * as OpenrouterAPI from "./api";
import * as OpenrouterMessages from "./messages";
import type * as OpenrouterModels from "./models";
import * as OpenrouterTools from "./tools";

namespace Openrouter {
  export const API = OpenrouterAPI;
  export const Messages = OpenrouterMessages;
  export const Tools = OpenrouterTools;

  export namespace Types {
    export type ChatCompletionsHeaders = z.infer<
      typeof OpenrouterAPI.ChatCompletionsHeadersSchema
    >;
    export type ChatCompletionsRequest = z.infer<
      typeof OpenrouterAPI.ChatCompletionRequestSchema
    >;
    export type ChatCompletionsResponse = z.infer<
      typeof OpenrouterAPI.ChatCompletionResponseSchema
    >;
    export type Usage = z.infer<typeof OpenrouterAPI.ChatCompletionUsageSchema>;

    export type FinishReason = z.infer<typeof OpenrouterAPI.FinishReasonSchema>;
    export type Message = z.infer<typeof OpenrouterMessages.MessageParamSchema>;
    export type Role = Message["role"];

    // OpenRouter uses OpenAI-compatible streaming format
    export type ChatCompletionChunk =
      OpenAIProvider.Chat.Completions.ChatCompletionChunk;
    export type Model = z.infer<typeof OpenrouterModels.ModelSchema>;
  }
}

export default Openrouter;
