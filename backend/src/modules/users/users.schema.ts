export const meResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "User session retrieved" },
    statusCode: { type: "integer", example: 200 },
    data: {
      type: "object",
      properties: {
        user: {
          type: "object",
          properties: {
            id: { type: "string", example: "u_123abc" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            emailVerified: { type: "boolean", example: true },
            image: {
              type: "string",
              example: "https://example.com/avatar.jpg"
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        session: {
          type: "object",
          properties: {
            id: { type: "string", example: "s_456def" },
            expiresAt: { type: "string", format: "date-time" },
            token: { type: "string", example: "abc123token" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
            ipAddress: { type: "string", example: "192.168.1.1" },
            userAgent: { type: "string", example: "Mozilla/5.0" },
            userId: { type: "string", example: "u_123abc" }
          }
        }
      }
    }
  }
};

export const unauthorizedResponseSchema = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Unauthorized" },
    statusCode: { type: "integer", example: 401 }
  }
};
