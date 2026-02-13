import { RouteId } from "@shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import logger from "@/logging";
import { constructResponseSchema, Xai, UuidIdSchema } from "@/types";
import { xaiAdapterFactory } from "../adapterV2";
import { PROXY_API_PREFIX, PROXY_BODY_LIMIT } from "../common";
import { handleLLMProxy } from "../llm-proxy-handler";
import * as utils from "../utils";
const xaiProxyRoutesV2: FastifyPluginAsyncZod = async (fastify) => {
  const API_PREFIX = `${PROXY_API_PREFIX}/xai`;
  logger.info("[UnifiedProxy] Registering unified x.ai routes");
  fastify.post(`${API_PREFIX}/chat/completions`, {
    bodyLimit: PROXY_BODY_LIMIT, schema: {
      operationId: RouteId.XaiChatCompletionsWithDefaultAgent,
      description: "Create a chat completion with x.ai/Grok (uses default agent)",
      tags: ["llm-proxy"], body: Xai.API.ChatCompletionRequestSchema,
      headers: Xai.API.ChatCompletionsHeadersSchema,
      response: constructResponseSchema(Xai.API.ChatCompletionResponseSchema),
    },
  }, async (request, reply) => {
    const externalAgentId = utils.externalAgentId.getExternalAgentId(request.headers);
    const executionId = utils.executionId.getExecutionId(request.headers);
    const userId = (await utils.user.getUser(request.headers))?.userId;
    return handleLLMProxy(request.body, request.headers, reply, xaiAdapterFactory, {
      organizationId: request.organizationId, agentId: undefined, externalAgentId, executionId, userId });
  });
  fastify.post(`${API_PREFIX}/:agentId/chat/completions`, {
    bodyLimit: PROXY_BODY_LIMIT, schema: {
      operationId: RouteId.XaiChatCompletionsWithAgent,
      description: "Create a chat completion with x.ai/Grok for a specific agent",
      tags: ["llm-proxy"], params: z.object({ agentId: UuidIdSchema }),
      body: Xai.API.ChatCompletionRequestSchema,
      headers: Xai.API.ChatCompletionsHeadersSchema,
      response: constructResponseSchema(Xai.API.ChatCompletionResponseSchema),
    },
  }, async (request, reply) => {
    const externalAgentId = utils.externalAgentId.getExternalAgentId(request.headers);
    const executionId = utils.executionId.getExecutionId(request.headers);
    const userId = (await utils.user.getUser(request.headers))?.userId;
    return handleLLMProxy(request.body, request.headers, reply, xaiAdapterFactory, {
      organizationId: request.organizationId, agentId: request.params.agentId, externalAgentId, executionId, userId });
  });
};
export default xaiProxyRoutesV2;
