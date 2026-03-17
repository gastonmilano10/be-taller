import swaggerJSDoc from "swagger-jsdoc";
import path from "path";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Taller API",
      version: "1.0.0",
      description:
        "Documentación de la API para el sistema de gestión de taller",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],
  },
  apis: [
    path.join(__dirname, "routes", "*.ts"),
    path.join(__dirname, "routes", "*.js"),
  ],
});
