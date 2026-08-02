import { z } from 'zod'

export const industryIdentifierSchema = z.object({
    type: z.string(),
    identifier: z.string()
})

export const imageLinksSchema = z.object({
    smallThumbnail: z.string().optional(),
    thumbnail: z.string().optional(),
    small: z.string().optional(),
    medium: z.string().optional(),
    large: z.string().optional(),
    extraLarge: z.string().optional(),
});

export const volumeInfoSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()).default([]),
    publisher: z.string().optional(),
    publishedDate: z.string().optional(),
    description: z.string().optional(),
    industryIdentifiers: z.array(industryIdentifierSchema).optional(),
    pageCount: z.number().optional(),
    categories: z.array(z.string()).default([]),
    imageLinks: imageLinksSchema.optional(),
    language: z.string().optional()
});

export const googleBookVolumeSchema = z.object({
    id: z.string(),
    volumeInfo: volumeInfoSchema,
});

export const googleBooksSearchResponseSchema = z.object({
    kind: z.string(),
    totalItems: z.number(),
    items: z.array(googleBookVolumeSchema).default([])
});

/* --------------------------------- VALIDATION TYPES --------------------------------- */
export type googleBookVolumeType = z.infer<typeof googleBookVolumeSchema>
export type googleBookSearchResponseType = z.infer<typeof googleBooksSearchResponseSchema>
export type volumeInfoType = z.infer<typeof volumeInfoSchema>