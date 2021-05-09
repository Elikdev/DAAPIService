import { AnySchema, ValidationError } from "joi";

export class RequestValidator {
  
  validationSchema: AnySchema;

  constructor(schema: AnySchema) {
    this.validationSchema = schema;
  }

  validate(requestData: unknown): void
  {
    const result = this.validationSchema.validate(requestData);

    if (result.error != null) 
    {
      const message: string = result.error.details.map(detail => detail.message).join(";");
      throw new ValidationError(
        message,
        result.error.details, 
        result.error._original
      );
    }
  }
}