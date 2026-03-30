import { z } from 'zod';

export const authEmailPasswordSchema = z.object({
  email: z.string().min(1, 'Bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
});

export type AuthEmailPasswordValues = z.infer<typeof authEmailPasswordSchema>;

export const authRegisterSchema = authEmailPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type AuthRegisterValues = z.infer<typeof authRegisterSchema>;
