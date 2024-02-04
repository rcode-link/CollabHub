import {defineStore} from "pinia";

export const useBreadcrumbStore = defineStore('breadcrumb', {
    state: () => ({links: [],base: []}),
    getters: {
      getLinks: (state) => {
          const finalLinks = [...state.base, ...state.links];
          return finalLinks.length > 3 ? finalLinks.slice(Math.max(finalLinks.length - 3, 1)) : finalLinks;
      }
    },
    actions: {
        setLinks(links) {
            this.base = links;
        },
        addEntry(link){
            this.links = link;
        },
    },
})
