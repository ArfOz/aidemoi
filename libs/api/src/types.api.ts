// import { Static, TObject } from '@sinclair/typebox';
// import { ApiResponseSuccessSchema, ApiResponseErrorSchema } from './schema';

// // ✅ Error tipi doğrudan şemadan türetilebilir
// export type ApiErrorResponseType = Static<typeof ApiResponseErrorSchema>;

// // ✅ Success tipi fonksiyon olduğu için ReturnType kullanıyoruz
// export type ApiSuccessResponseType<T extends TObject> = Static<
//   ReturnType<typeof ApiResponseSuccessSchema<T>>
// >;

// // ✅ Union response tipi (her endpoint için)
// export type ApiResponseType<T extends TObject> =
//   | ApiSuccessResponseType<T>
//   | ApiErrorResponseType;
