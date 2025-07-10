<script setup>
    import { ref } from 'vue';
    import Model from '../frontend/model.js';
    import { version } from '../../package.json';

    import Help from './help.vue';
    import Console from './console.vue';
    import Status from './status.vue';

    const CLEANUP_DELAY = 30; // s
    const consoleShown = ref(false);
    const helpShown = ref(true);
    const logs = ref([]);
    const model = ref(new Model());

    const close = () => window.actions.close();
    const enableDevTools = () => window.actions.devTools();
    const minimize = () => window.actions.minimize();
    const selectChat = () => window.actions.selectChat();
    const toggleConsole = () => consoleShown.value = !consoleShown.value;
    const toggleHelp = () => helpShown.value = !helpShown.value;

    window.events.onError((message) => {
        logs.value.push(`[${new Date().toLocaleTimeString()}] ERROR: ${message}.`);
    });

    window.events.onUpdateNode(({ character, reportDate, systemName, nodeId, state, expiration }) => {
        model.value.update(reportDate, systemName, nodeId, state, expiration);
        logs.value.push(`[${reportDate.toLocaleTimeString()}] ${character} updated node ${nodeId} in system ${systemName} - state: ${state}, timer: ${expiration.toLocaleTimeString()}.`);
    });

    function updateStaleNodes() {
        const stales = model.value.cleanStales(CLEANUP_DELAY * 1000);
        stales.forEach((node) => logs.value.push(`[${new Date().toLocaleTimeString()}] Stale node ${node.id} in system ${node.systemName} removed.`));
        setTimeout(updateStaleNodes, 1000);
    }
    updateStaleNodes();
</script>

<template>
    <header>
        <a class="topbar_btn" id="select_chat_btn" @click="selectChat()"></a>
        <a class="topbar_btn" id="help_btn" @click="toggleHelp()"></a>
        <a class="topbar_btn" id="minimize_btn" @click="minimize()"></a>
        <a class="topbar_btn" id="close_btn" @click="close()"></a>
    </header>
    <h1>Entosis Helper</h1>
    <section>
        <Console :logs="logs" v-if="consoleShown" />
        <Status :systems="model.systems" />
        <Help v-if="helpShown" />
    </section>
    <footer>
        Created by Ryanis | <span id="version">v{{ version }}</span> | <a @click.prevent="toggleConsole()">Console logs</a> | <a @click.prevent="enableDevTools()">Dev Tools</a>
    </footer>
</template>

<style>
    section {
        background: #FFF;
        padding: 10px 20px;
        overflow: auto;
        -webkit-app-region: no-drag;
    }
    .console, .status, .help {
        padding-bottom: 10px;
    }
    .console {
        border-bottom: 1px solid #BDBDBD;
    }
    .help {
        border-top: 1px solid #BDBDBD;
    }
    footer {
        color: #FFF;
        font-size: .8em;
        margin: 0;
        padding: 20px 10px;
        text-align: center;
        -webkit-app-region: no-drag;
    }
    footer a {
        color: #FFF;
    }
</style>
