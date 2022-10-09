export const scriptRE = /(<script\b(?:\s[^>]*>|>))(.*?)<\/script>/gims;

export type Extension = {
  key: string;
  transformer?: (code: string, query?: any) => string;
};

export type tagExtension = {
  reg: RegExp;
  key: string;
  transformer: (...opts: any[]) => string;
};
export function compile(
  source: string,
  transformExt: Extension[],
  addonExt: Extension[],
  tagExt: tagExtension[]
) {
  let addonScript = "";
  let transformScript = "";
  for (let i of tagExt) {
    console.log(i.reg.test(source))
    source = source.replace(i.reg, (str, ...args) => {
      console.log(args)
      addonScript += i.transformer(...args)+ "\n";;
      return "";
    });
  }
  source = source.replace(scriptRE, (str, tag, script) => {
    let query = parseQuery(tag);

    for (let i of transformExt) {
      if (i.key in query) {
        transformScript += i.transformer
          ? i.transformer(script, query) + "\n"
          : script + "\n";
        return "";
      }
    }
    for (let i of addonExt) {
      if (i.key in query) {
        addonScript += i.transformer
          ? i.transformer(script, query) + "\n"
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
