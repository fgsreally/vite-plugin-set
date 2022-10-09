export const scriptRE = /(<script\b(?:\s[^>]*>|>))(.*?)<\/script>/gims;

export type Extension = {
  key: string;
  transformer?: (code: string, query?: any) => string;
};
export function compile(
  source: string,
  transform: Extension[],
  addon: Extension[]
) {
  let addonScript = "";
  let transformScript = "";
  source = source.replace(scriptRE, (str, tag, script) => {
    let query = parseQuery(tag);
  
    for (let i of transform) {
      if (i.key in query) {
        transformScript += i.transformer
          ? i.transformer(script, query)
          : script + "\n";
        return "";
      }
    }
    for (let i of addon) {
      if (i.key in query) {
        addonScript += i.transformer
          ? i.transformer(script, query)
          : script + "\n";
        return "";
      }
    }
    if (query.setup) {
      return `${tag}${transformScript}${script}</script>`;
    }
    return str;
  });
  return { addonScript, source };
}

let queryRE = /(\w*)="(.*)"/;
function parseQuery(tag: string) {
  let query: any = {};
  let queryArr = tag.slice(7, -1).split(" ");
  for (let i of queryArr) {
    if (!i) continue;
    if (queryRE.test(i)) {
      let ret = i.match(queryRE) as string[];
      query[ret[1]] = ret[2];
    } else {
      query[i] = true;
    }
  }
  return query;
}
