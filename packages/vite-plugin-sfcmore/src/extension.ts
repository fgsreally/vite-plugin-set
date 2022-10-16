export let Test = {
  key: "test",
  transformer: (code: string, query: any) => {
    return `export let test=(()=>{${code}})()`;
  },
};

export let Server = {
  key: "server",
};

export let Docs = {
  reg: /<docs>([\s\S]*)<\/docs>/,
  key: "docs",
  transformer: (code: string) => {
    return `export let docs=${JSON.stringify(code)}`;
  },
};

export let Type = {
  key: "type",
  transformer: (code: string) => {
    return `export let type=${JSON.stringify(code)}`;
  },
};

export let defaultAddon = [Test, Type];
export let defaultTransform = [Server];
export let defaultTag = [Docs];

export let addonCss = (url) => `
export let css= ${url}
`;
