<template>
    <div class="mention-items">
        <template v-if="items.length">
            <button
                class="mention-item"
                :class="{ 'is-selected': index === selectedIndex }"
                v-for="(item, index) in items"
                :key="item.id"
                :ref="el => itemRefs[index] = el"
                @click="selectItem(index)"
            >
                <img v-if="item.avatar" :src="item.avatar" class="mention-avatar" alt="" />
                <span v-else class="mention-avatar mention-avatar-fallback">{{ initials(item.name) }}</span>
                <span class="mention-text">
                    <span class="mention-name">{{ item.name }}</span>
                    <span v-if="item.email" class="mention-email">{{ item.email }}</span>
                </span>
            </button>
        </template>
        <div class="mention-empty" v-else>
            No users found
        </div>
    </div>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },

        command: {
            type: Function,
            required: true,
        },
    },

    data() {
        return {
            selectedIndex: 0,
            itemRefs: [],
        }
    },

    watch: {
        items() {
            this.selectedIndex = 0
            this.itemRefs = []
        },
    },

    methods: {
        initials(name) {
            return String(name ?? '')
                .split(' ')
                .map(part => part[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase()
        },

        onKeyDown({ event }) {
            if (event.key === 'ArrowUp') {
                this.upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                this.downHandler()
                return true
            }

            if (event.key === 'Enter') {
                this.enterHandler()
                return true
            }

            return false
        },

        scrollSelectedIntoView() {
            this.$nextTick(() => {
                this.itemRefs[this.selectedIndex]?.scrollIntoView({ block: 'nearest' })
            })
        },

        upHandler() {
            this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
            this.scrollSelectedIntoView()
        },

        downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length
            this.scrollSelectedIntoView()
        },

        enterHandler() {
            this.selectItem(this.selectedIndex)
        },

        selectItem(index) {
            const item = this.items[index]
            if (item) {
                this.command({ id: item.id, label: item.name })
            }
        },
    },
}
</script>

<style>
/* Strip tippy's default dark chrome — the list carries its own card styling */
.tippy-box[data-theme~='mention'] {
    background: transparent;
    box-shadow: none;
    color: inherit;
}
.tippy-box[data-theme~='mention'] .tippy-content {
    padding: 0;
}

.mention-items {
    padding: 0.25rem;
    position: relative;
    border-radius: 0.75rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    font-size: 0.875rem;
    min-width: 14rem;
    max-height: 16rem;
    overflow-y: auto;
}
.dark .mention-items {
    background: #1f2937;
    border-color: #374151;
}

.mention-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    width: 100%;
    text-align: left;
    background: transparent;
    border-radius: 0.5rem;
    border: none;
    padding: 0.375rem 0.5rem;
    color: #111827;
    cursor: pointer;
}
.dark .mention-item {
    color: #f9fafb;
}
.mention-item.is-selected,
.mention-item:hover {
    background: #eff6ff;
}
.dark .mention-item.is-selected,
.dark .mention-item:hover {
    background: rgb(30 58 138 / 0.35);
}

.mention-avatar {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 9999px;
    object-fit: cover;
    flex-shrink: 0;
}
.mention-avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #4a90e2;
    color: #fff;
    font-size: 0.625rem;
    font-weight: 600;
}

.mention-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.mention-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.mention-email {
    font-size: 0.6875rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.dark .mention-email {
    color: #9ca3af;
}

.mention-empty {
    padding: 0.5rem 0.75rem;
    color: #6b7280;
}
.dark .mention-empty {
    color: #9ca3af;
}
</style>
