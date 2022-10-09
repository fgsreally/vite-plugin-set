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

export let defaultAddon = [Test, Docs];
export let defaultTransform = [Server];
