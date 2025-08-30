declare module '@hookform/resolvers/zod' {
  import { AnyZodObject, ZodType } from 'zod';
  import { Resolver } from 'react-hook-form';

  export function zodResolver<T>(
    schema: AnyZodObject | ZodType,
    schemaOptions?: Partial<{ async: boolean }>,
    resolverOptions?: Record<string, unknown>
  ): Resolver<T>;

  export default zodResolver;
}
