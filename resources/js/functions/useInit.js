import { useUserStore } from '@/store/user'
import { Ability, AbilityBuilder } from '@casl/ability'
import ability from '@/functions/ability.js'
import { ref, watch } from 'vue'
import { initEcho } from '@/bootstrap.js'
import { useTextToLinkStore } from '@/store/textToLinkStore'
import { chatDetails } from '@/store/chatStore.js'

import '@/declaration'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import VideoToast from '@/components/shared/video/VideoToast.vue'
import { initAxios } from '@/axios.js'
import { initElectron, setElectronBadge, showElectronNotification } from '@/functions/useElectron.js'
import { initCapacitor, showCapacitorNotification, setCapacitorBadge } from '@/functions/useCapacitor.js'
import { useNotificationSettings, getPlatform } from '@/functions/useNotificationSettings.js'

const isWindowFocused = ref(
    typeof document !== 'undefined' ? document.hasFocus() : true,
)

export default () => {
    const userState = useUserStore()
    const messagesState = chatDetails()
    const router = useRouter()

    if (!localStorage.getItem('token')) {
        return
    }

    const textToLinkStore = useTextToLinkStore()
    const { shouldNotify } = useNotificationSettings()

    initEcho()
    initAxios()
    initElectron()
    initCapacitor()
    textToLinkStore.load()

    window.axios
        .get('/api/v1/companies')
        .then(response => userState.setCompany(response.data))

    window.axios.get('/api/v1/user').then(res => {
        userState.setUser(res.data)
        loadNumberOfUnreadMessages()
        window.Echo.private(`start-call.${res.data.data.id}`).listen(
            'StartVideoCall',
            videoCallNotification,
        )

        window.Echo.private('UpdateChatForUser.' + res.data.data.id).listen(
            'ChatUpdate',
            UpdateChatForUser,
        )
    })

    window.axios.get('/api/v1/permissions/my').then(res => {
        const { can, rules } = new AbilityBuilder(Ability)
        can(res.data, '')
        ability.update(rules)
    })

    watch(
        () => userState.company?.id,
        () => {
            if (!userState.company.id) {
                return
            }
            window.Echo.join(`user.${userState.company.id}`)
                .here(users => {
                    userState.setOnlineUsers(users)
                })
                .joining(user => {
                    userState.addOnlineUser(user)
                })
                .leaving(user => {
                    userState.setOnlineUsers(
                        userState.onlineUsers.filter(obj => obj.id !== user.id),
                    )
                })
        },
        {
            immediate: true,
        },
    )

    // Update the page title based on message count
    const updatePageTitle = () => {
        if (userState.newMessages > 0) {
            document.title = `(${userState.newMessages}) ${userState.originalTitle}`
        } else {
            document.title = userState.originalTitle
        }
    }

    // Handle showing notifications safely

    const UpdateChatForUser = async data => {
        loadNumberOfUnreadMessages()
        const isCurrentUserSender = userState.user.name === data.message.user
        if (!isCurrentUserSender) {
            showAppNotification({
                type: 'message',
                title: `${data.message.user} messaged you`,
                body: data.message.text,
            })
        }
    }

    const videoCallNotification = data => {
        const isCurrentUserCaller = data.callId.user.id === userState.user.id
        if (isCurrentUserCaller) return

        toast(VideoToast, {
            data: {
                callerName: data.callId.user.name,
                callId: data.callId.videocalls.slug,
            },
            type: 'info',
        })
        showAppNotification({
            type: 'videoCall',
            title: `${data.callId.user.name} is calling you`,
            body: 'Incoming video call',
        })
    }

    /**
     * Unified notification dispatcher.
     * Checks user preferences, then routes to the right native API:
     * - Electron → electronAPI.showNotification
     * - Capacitor → LocalNotifications.schedule
     * - Browser → Notification API
     */
    const showAppNotification = ({ type, title, body }) => {
        if (!shouldNotify(type)) return

        const platform = getPlatform()

        if (platform === 'electron') {
            showElectronNotification({ title, body })
        } else if (platform === 'capacitor') {
            showCapacitorNotification({ title, body })
        } else {
            // Browser: use the Notification API directly
            if ('Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    body,
                    icon: '/img/android/android-launchericon-512-512.png',
                })
                notification.onclick = () => {
                    window.focus()
                    notification.close()
                }
            }
        }
    }

    const loadNumberOfUnreadMessages = () => {
        window.axios.get('/api/v1/chats/number-of-unread-messages').then(res => {
            userState.setNewMessages(res.data)
            // Update page title after setting new messages
            updatePageTitle()

            res.data.messages.forEach(data => {
                messagesState.updateUnreadMessages(data)
            })
        })
    }

    // Watch for changes in message count to update title and badge
    watch(
        () => userState.newMessages,
        (count) => {
            updatePageTitle()
            setElectronBadge(count)
            setCapacitorBadge(count)
        },
    )
}
