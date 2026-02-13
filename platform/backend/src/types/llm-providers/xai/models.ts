/**
 * x.ai Model Types
 *
 * x.ai uses OpenAI-compatible model listing format.
 */
import { z } from "zod";

export const ModelSchema = z
  .object({
    id: z
      .string()
      .describe(
        "The model identifier, which can be referenced in the API endpoints.",
      ),
    created: z
      .number()
      .describe("The Unix timestamp (in seconds) when the model was created."),
    object: z
      .enum(["model"])
      .describe('The object type, which is always "model".'),
    owned_by: z.string().describe("The organization that owns the model."),
    // x.ai-specific fields
    root: z
      .string()
      .optional()
      .describe("The root model this was derived from"),
    parent: z.string().nullable().optional().describe("The parent model"),
  })
  .describe("A x.ai model object");

export const ModelsListResponseSchema = z
  .object({
    object: z.enum(["list"]),
    data: z.array(ModelSchema),
  })
  .describe("x.ai models list response");
