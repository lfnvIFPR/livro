import { z } from "zod";

export const ManifestSchema = z.object({
  titulo: z.string(),
  autor: z.union([z.string(), z.array(z.string())]),
  capitulos: z.array(z.union([z.string(), z.array(z.string()).min(1, "O livro deve ter pelo menos um capítulo;")])),
  figuras: z.array(z.string()).optional()
})

export type Manifest = z.infer<typeof ManifestSchema>;