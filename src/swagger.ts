import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Taller API",
      version: "1.0.0",
      description: "Documentación de la API para el sistema de gestión de taller",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Ruta donde escribiremos los comentarios Swagger
});
