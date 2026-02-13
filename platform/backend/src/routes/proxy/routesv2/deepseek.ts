/**
 * DeepSeek Proxy Routes
 *
 * DeepSeek exposes an OpenAI-compatible API.
 * See: https://api-docs.deepseek.com/
 */
import { RouteId } from "@shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import logger from "@/logging";
import { constructResponseSchema, Deepseek, UuidIdSchema } from "@/types";
import { deepseekAdapterFactory } from "../adapterV2";
import { PROXY_API_PREFIX, PROXY_BODY_LIMIT } from "../common";
import { handleLLMProxy } from "../llm-proxy-handler";
import * as utils from "../utils";


const deepseekProxyRoutesV2: FastifyPluginAsyncZod = async (fastify) => {
  const API_PREFIX = `${PROXY_API_PREFIX}/deepseek`;

  logger.info("[UnifiedProxy] Registering unified DeepSeek routes");

  fastify.post(
    `${API_PREFIX}/chat/completions`,
    {
      bodyLimit: PROXY_BODY_LIMIT,
      schema: {
        operationId: RouteId.DeepseekChatCompletionsWithDefaultAgent,
        description:
          "Create a chat completion with DeepSeek (uses default agent)",
        tags: ["llm-proxy"],
        body: Deepseek.API.ChatCompletionRequestSchema,
        headers: Deepseek.API.ChatCompletionsHeadersSchema,
        response: constructResponseSchema(
          Deepseek.API.ChatCompletionResponseSchema,
        ),
      },
    },
    async (request, reply) => {
      logger.debug(
        { url: request.url },
        "[UnifiedProxy] Handling DeepSeek request (default agent)",
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
        deepseekAdapterFactory,
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
        operationId: RouteId.DeepseekChatCompletionsWithAgent,
        description:
          "Create a chat completion with DeepSeek for a specific agent",
        tags: ["llm-proxy"],
        params: z.object({
          agentId: UuidIdSchema,
        }),
        body: Deepseek.API.ChatCompletionRequestSchema,
        headers: Deepseek.API.ChatCompletionsHeadersSchema,
        response: constructResponseSchema(
          Deepseek.API.ChatCompletionResponseSchema,
        ),
      },
    },
    async (request, reply) => {
      logger.debug(
        { url: request.url, agentId: request.params.agentId },
        "[UnifiedProxy] Handling DeepSeek request (with agent)",
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
        deepseekAdapterFactory,
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

export default deepseekProxyRoutesV2;
