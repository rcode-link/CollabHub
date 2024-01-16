import { useUserStore } from "../store/user.js";
import { initAxios } from "../axios.js";
import { Ability, AbilityBuilder } from "@casl/ability";
import ability from "./ability.js";
import { watch } from "vue";
import { initEcho } from "../bootstrap.js";
import { useTextToLinkStore } from "../store/textToLinkStore.js";

export default () => {
    const userState = useUserStore();
    if (!localStorage.getItem('token')) {
        return;
    }
    const textToLinkStore = useTextToLinkStore()

    initEcho();
    initAxios();
    textToLinkStore.load();
    window.axios.get('/api/v1/companies')
        .then((response) => userState.setCompany(response.data));
    window.axios.get('/api/v1/user').then(res => {
        userState.setUser(res.data)
    })
    window.axios.get<any, {
        data: string[]
    }>('/api/v1/permissions/my').then(res => {
        const { can, rules } = new AbilityBuilder(Ability)
        can(res.data, '')
        ability.update(rules)
    })

    watch(() => userState.company.id, () => {
        if (!userState.company.id) {
            return;
        }
        window.Echo.join(`user.${userState.company.id}`)
            .here((users) => {
                userState.setOnlineUsers(users)
            })
            .joining((user) => {
                userState.addOnlineUser(user);

            })
            .leaving((user) => {
                userState.setOnlineUsers(userState.onlineUsers.filter(obj => obj.id !== user.id));

            })
            .error((error) => {
                console.error(error);
            });


    }, {
        immediate: true
    })


    Notification.requestPermission().then(r => console.log(r));
}
