export default function(/** @type {import('plop').NodePlopAPI} */ plop) {
  plop.setGenerator("function", {
    description: "vite plugin template",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "plugin name",
      },
    ],
    actions: (data) => {
      return [
        {
          type: "add",
          path: "packages/{{name}}/tsup.config.ts",
          templateFile: "template/tsup.config.hbs",
        },
        {
          type: "add",
          path: "packages/{{name}}/package.json",
          templateFile: "template/package.hbs",
        },
        {
          type: "add",
          path: "packages/{{name}}/src/index.ts",
          templateFile: "template/src/index.hbs",
        },
      ];
    },
  });
}
