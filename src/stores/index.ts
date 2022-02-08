import { defineStore } from "pinia";
import type { BuildOptions, Loader, Message, Plugin } from "esbuild";
import { compile, preprocess } from "svelte/compiler";

export type EsbuildType = typeof import("esbuild");

export interface Module {
  name: string;
  contents: string;
  isEntry: boolean;
}

export interface Outputs {
  files?: Module[];
  errors?: Message[];
  warnings?: Message[];
}

function normalizeName(path: string) {
  return "/" + path.replace(/^[.\/]*/g, "");
}

function stripExt(path: string) {
  const i = path.lastIndexOf(".");
  return i !== -1 ? path.slice(0, i) : path;
}

function repl($modules: Module[]): Plugin {
  const cache: Record<string, { url: string; content: string }> = {};
  return {
    name: "repl",
    setup({ onResolve, onLoad }) {
      onResolve({ filter: /.*/ }, (args) => {
        const absPath = normalizeName(args.path);

        let mod = $modules.find((e) => normalizeName(e.name) === absPath);
        if (mod) return { path: normalizeName(mod.name), pluginData: mod };

        mod = $modules.find(
          (e) => stripExt(normalizeName(e.name)) === stripExt(absPath)
        );
        if (mod) return { path: normalizeName(mod.name), pluginData: mod };

        return { path: args.path, external: true };
      });

      onLoad({ filter: /.*/ }, async (args) => {
        // if (args.namespace === UnpkgNamepsace) {
        //   const baseUrl = "https://unpkg.com/";
        //   const pathUrl = new URL(args.path, baseUrl).toString();
        //   let value = cache[pathUrl];
        //   if (!value) {
        //     value = await fetchPkg(pathUrl);
        //   }
        //   cache[pathUrl] = value;
        //   return {
        //     contents: value.content,
        //     pluginData: {
        //       parentUrl: value.url,
        //     },
        //   };
        // }

        const mod: Module | undefined = args.pluginData;
        const isSvelte = args.path.endsWith(".svelte");
        if (mod) {
          let content = mod.contents;
          let loader: Loader =
            stripExt(args.path) === args.path || isSvelte ? "js" : "js";

          if (isSvelte) {
            const compiled = compile(content, {});
            let { js, css } = compiled;
            content = js.code;
          }

          return { contents: content, loader };
        }
      });
    },
  };
}

export const useEsbuildStore = defineStore("useEsbuild", () => {
  const state = reactive({
    loading: true,
    status: "Loading...",
    esbuild: null as EsbuildType | null,
    modules: [
      {
        name: "main.js",
        contents: `
    import App from './App.svelte'

    const createApp = () => new App({
      target: document.body,
    })

    export default createApp
    `,
        isEntry: true,
      },
      {
        name: "App.svelte",
        contents: `
    <script>
      let count = 1
    </script>
    <button on:click={() => count++}>Counter: {count} </button>
    `,
        isEntry: true,
      },
    ] as Module[],
    timer: 0,
  });

  function time() {
    state.timer = performance.now();
  }

  function timeEnd() {
    const elapsed = performance.now() - state.timer;
    state.status = `Finished in ${elapsed.toFixed(2)}ms.`;
  }

  const {
    state: outputs,
    isLoading,
    execute,
  } = useAsyncState(
    async () => {
      const entryPoints = state.modules
        .filter((e) => e.isEntry)
        .map((e) => e.name);
      if (entryPoints.length === 0) return {};

      const buildOptions: BuildOptions = {
        entryPoints,
        bundle: true,
        format: "iife",
        minify: true,
        globalName: "createApp",
        write: false,
      };

      (buildOptions.plugins ||= []).unshift(repl(state.modules));
      buildOptions.outdir = "/";
      buildOptions.write = false;
      buildOptions.allowOverwrite = true;
      time();

      const result = await new Promise<Outputs>((resolve) => {
        if (!state.esbuild)
          return {
            files: [
              { name: "main.js", contents: "// initializing", isEntry: false },
            ],
          } as Outputs;
        state.esbuild
          .build(buildOptions as BuildOptions & { write: false })
          .then(({ outputFiles, errors, warnings }) => {
            const files = outputFiles.map(
              (file) =>
                ({
                  name: file.path,
                  contents: file.text,
                  isEntry: false,
                } as Module)
            );
            resolve({ files, errors, warnings });
          })
          .catch(resolve)
          .finally(timeEnd);
      });

      return result;
    },
    {
      files: [{ name: "main.js", contents: "// initializing", isEntry: false }],
    },
    { immediate: false }
  );

  watch(
    [() => state.esbuild, () => state.modules],
    ([newEsbuild, newModules]) => {
      execute()
    },
    { deep: true }
  );

  return {
    ...toRefs(state),
    outputs,
    execute,
    isLoading,
  };
});
