import hljs from "highlight.js";

hljs.listLanguages().forEach(async (lang) => {
    console.log(hljs.getLanguage(lang));
    // lowlight.register(lang, item.default);
})
