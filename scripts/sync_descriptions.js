const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const SWAGGER_PATH = path.join(__dirname, '..', 'public', 'croissant_swagger.json');
// URL de l'API locale (ajuster si nécessaire)
const DESCRIBE_URL = 'https://croissant-api.fr/api/describe';

function ensureObject(obj, key) {
  if (!obj[key]) obj[key] = {};
  return obj[key];
}

function methodsFromDesc(desc) {
  if (!desc) return ['get'];
  if (Array.isArray(desc.method)) return desc.method.map((m) => String(m).toLowerCase());
  if (typeof desc.method === 'string') {
    return desc.method
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m) => m.toLowerCase());
  }
  return ['get'];
}

function defaultResponsesForMethod(method) {
  method = method.toLowerCase();
  const common = {
    "400": {
      description: "Bad Request",
      content: { "application/json": { schema: { type: "object" } } }
    },
    "500": {
      description: "Internal server error",
      content: { "application/json": { schema: { type: "object" } } }
    }
  };

  if (method === 'post') {
    return {
      "201": {
        description: "Created",
        content: { "application/json": { schema: { type: "object" } } }
      },
      ...common
    };
  }

  if (method === 'delete') {
    return {
      "204": { description: "No Content" },
      ...common
    };
  }

  if (method === 'put' || method === 'patch') {
    return {
      "200": {
        description: "Success",
        content: { "application/json": { schema: { type: "object" } } }
      },
      ...common
    };
  }

  // GET and others
  return {
    "200": {
      description: "Success",
      content: { "application/json": { schema: { type: "object" } } }
    },
    ...common
  };
}

(async () => {
  try {
    const res = await fetch(DESCRIBE_URL);
    if (!res.ok) throw new Error(`Failed to fetch ${DESCRIBE_URL}: ${res.status}`);
    const descriptions = await res.json();

    const swaggerRaw = fs.readFileSync(SWAGGER_PATH, 'utf8');
    const swagger = JSON.parse(swaggerRaw);

    for (const desc of descriptions) {
      // Ne garder que les endpoints publiques (requiresAuth !== true)
      if (desc.requiresAuth === true) continue;

      const endpoint = desc.endpoint.startsWith('/') ? desc.endpoint : `/${desc.endpoint}`;
      if (!swagger.paths) swagger.paths = {};

      if (!swagger.paths[endpoint]) swagger.paths[endpoint] = {};

      const methods = methodsFromDesc(desc);

      for (const method of methods) {
        if (swagger.paths[endpoint][method]) continue; // déjà présent

        // Construire une entrée minimale à partir de la description
        const pathItem = {
          tags: [desc.category || 'Public'],
          summary: desc.description ? String(desc.description).split('\n')[0] : desc.endpoint,
          description: desc.description || '',
          responses: defaultResponsesForMethod(method)
        };

        // params -> OpenAPI parameters
        if (desc.params) {
          pathItem.parameters = [];
          for (const [name, text] of Object.entries(desc.params)) {
            pathItem.parameters.push({
              name,
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: typeof text === 'string' ? text : JSON.stringify(text)
            });
          }
        }

        // body -> requestBody (for non-GET methods typically)
        const methodHasBody = ['post', 'put', 'patch'].includes(method);
        if (desc.body || methodHasBody) {
          pathItem.requestBody = {
            required: !!desc.body,
            content: {
              "application/json": {
                schema: desc.bodySchema || { type: "object", properties: {} }
              }
            }
          };
        }

        // add security if descriptor explicitly indicates it (kept for completeness; public endpoints are filtered above)
        if (desc.requiresAuth) {
          pathItem.security = [{ "BearerAuth": [] }];
        }

        swagger.paths[endpoint][method] = pathItem;
        console.log(`Added ${method.toUpperCase()} ${endpoint}`);
      }
    }

    // sauvegarde
    fs.writeFileSync(SWAGGER_PATH, JSON.stringify(swagger, null, 2), 'utf8');
    console.log('Swagger file updated:', SWAGGER_PATH);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();