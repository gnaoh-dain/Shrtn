import { z } from 'zod';

/** Gần với body POST /shorten — gắn `fetch` thật sau. */
export const shortenDemoSchema = z.object({
  url: z.string().min(1, 'Bắt buộc').url('URL không hợp lệ'),
  customAlias: z.string().max(64, 'Tối đa 64 ký tự'),
});

export type ShortenDemoValues = z.infer<typeof shortenDemoSchema>;
