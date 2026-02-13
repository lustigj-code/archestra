/**
 * OpenRouter Proxy Routes
 *
 * OpenRouter provides a unified API for accessing multiple LLM providers.
 * See: https://openrouter.ai/docs/quickstart
 */
import { RouteId } from "@shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import logger from "@/logging";
import { constructResponseSchema, Openrouter, UuidIdSchema } from "@/types";
import { openrouterAdapterFactory } from "../adapterV2";
import { PROXY_API_PREFIX, PROXY_BODY_LIMIT } from "../common";
import { handleLLMProxy } from "../llm-proxy-handler";
import * as utils from "../utils";

const openrouterProxyRoutesV2: FastifyPluginAsyncZod = async (fastify) => {
  const API_PREFIX = `${PROXY_API_PREFIX}/openrouter`;

  logger.info("[UnifiedProxy] Registering unified OpenRouter routes");

  fastify.post(
    `${API_PREFIX}/chat/completions`,
    {
      bodyLimit: PROXY_BODY_LIMIT,
      schema: {
        operationId: RouteId.OpenrouterChatCompletionsWithDefaultAgent,
        description:
          "Create a chat completion with OpenRouter (uses default agent)",
        tags: ["llm-proxy"],
        body: Openrouter.API.ChatCompletionRequestSchema,
        headers: Openrouter.API.ChatCompletionsHeadersSchema,
        response: constructResponseSchema(
          Openrouter.API.ChatCompletionResponseSchema,
        ),
      },
    },
    async (request, reply) => {
      logger.debug(
        { url: request.url },
        "[UnifiedProxy] Handling OpenRouter request (default agent)",
      );
      const externalAgentId = utils.externalAgentId.getExternalAgentId(
        request.headers,
      );
      const executionId = utils.executionId.getExecutionId(request.headers);
      const userId = (await utils.user.getUser(request.headers))?.userId;
      return handleLLMProxy(
        request.body,
        request.headers,
        reply,
        openrouterAdapterFactory,
        {
          organizationId: request.organizationId,
          agentId: undefined,
          externalAgentId,
          executionId,
          userId,
        },
      );
    },
  );

  fastify.post(
    `${API_PREFIX}/:agentId/chat/completions`,
    {
      bodyLimit: PROXY_BODY_LIMIT,
      schema: {
        operationId: RouteId.OpenrouterChatCompletionsWithAgent,
        description:
          "Create a chat completion with OpenRouter for a specific agent",
        tags: ["llm-proxy"],
        params: z.object({
          agentId: UuidIdSchema,
        }),
        body: Openrouter.API.ChatCompletionRequestSchema,
        headers: Openrouter.API.ChatCompletionsHeadersSchema,
        response: constructResponseSchema(
          Openrouter.API.ChatCompletionResponseSchema,
        ),
      },
    },
    async (request, reply) => {
      logger.debug(
        { url: request.url, agentId: request.params.agentId },
        "[UnifiedProxy] Handling OpenRouter request (with agent)",
      );
      const externalAgentId = utils.externalAgentId.getExternalAgentId(
        request.headers,
      );
      const executionId = utils.executionId.getExecutionId(request.headers);
      const userId = (await utils.user.getUser(request.headers))?.userId;
      return handleLLMProxy(
        request.body,
        request.headers,
        reply,
        openrouterAdapterFactory,
        {
          organizationId: request.organizationId,
          agentId: request.params.agentId,
          externalAgentId,
          executionId,
          userId,
        },
      );
    },
  );
};

export default openrouterProxyRoutesV2;
