import express from 'express';
import { z } from 'zod';
import { ApiError } from '../lib/api-error.js';
export const handleApiError = (
  err: unknown,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) => {
  if (err instanceof z.ZodError)
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'راجعي البيانات المدخلة.',
        fields: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
    });
  if (err instanceof ApiError)
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  if (err instanceof SyntaxError && 'body' in err)
    return res
      .status(400)
      .json({ error: { code: 'INVALID_JSON', message: 'تعذر قراءة البيانات.' } });
  if ((err as any)?.type === 'entity.too.large' || (err as any)?.status === 413)
    return res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'حجم الصورة كبير جداً، يرجى اختيار صورة أصغر من 20 ميجابايت.' },
    });
  console.error('Request failed:', err instanceof Error ? (err.stack || err.message) : err);
  res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'تعذر إكمال الطلب الآن. بياناتك موجودة في النموذج؛ حاولي مرة أخرى.',
    },
  });
};
