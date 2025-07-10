<script setup>
    import { computed, ref } from 'vue'
    import Node from './node.vue';

    const detailsShown = ref(true);
    const { name, nodes } = defineProps({ name: String, nodes: Array });
    const neutralNodes = computed(() => nodes.filter((node) => node.state === 'neutral'));
    const friendlyNodes = computed(() => nodes.filter((node) => node.state === 'friendly'));
    const enemyNodes = computed(() => nodes.filter((node) => node.state === 'enemy'));
    const toggleDetails = () => detailsShown.value = !detailsShown.value;
</script>

<template>
    <div class="system_name" @click="toggleDetails">{{ name }}</div>
    <div class="nb_neutral">{{ neutralNodes.length }}</div>
    <div class="nb_friendly">{{ friendlyNodes.length }}</div>
    <div class="nb_enemy">{{ enemyNodes.length }}</div>
    <ul class="system_details" v-show="detailsShown">
        <li>
            <em class="neutral_nodes_label">Neutral</em>:
            <span class="neutral_nodes">
                <Node :id="node.id" :expiration="node.expiration" :state="node.state" v-for="node in neutralNodes" />
                <span v-if="neutralNodes.length === 0">
                    none
                </span>
            </span>
        </li>
        <li>
            <em class="friendly_nodes_label">Friendly</em>:
            <span class="friendly_nodes">
                <Node :id="node.id" :expiration="node.expiration" :state="node.state" v-for="node in friendlyNodes" />
                <span v-if="friendlyNodes.length === 0">
                    none
                </span>
            </span>
        </li>
        <li>
            <em class="enemy_nodes_label">Enemy</em>:
            <span class="enemy_nodes">
                <Node :id="node.id" :expiration="node.expiration" :state="node.state" v-for="node in enemyNodes" />
                <span v-if="enemyNodes.length === 0">
                    none
                </span>
            </span>
        </li>
    </ul>
</template>

<style>
    .system_name, .nb_neutral, .nb_friendly, .nb_enemy {
        color: #FFF;
        display: inline-block;
        padding: 5px 10px;
    }
    .nb_neutral, .nb_friendly, .nb_enemy {
        border-radius: 99px;
        border: 2px solid #FFF;
        display: inline-block;
        margin-left: -3px;
    }
    .system_name {
        border-radius: 15px 0 15px 0;
        background-color: #303F9F;
        border: 2px solid #303F9F;
        margin-left: -2px;
        min-width: 85px;
        text-align: center;
    }
    .nb_neutral {
        background-color: #757575;
    }
    .nb_friendly {
        background-color: #4CAF50;
    }
    .nb_enemy {
        background-color: #E91E63;
    }
    .system_details {
        list-style: none;
        padding: 5px 10px;
    }
    .neutral_nodes_label {
        color: #757575;
    }
    .friendly_nodes_label {
        color: #4CAF50;
    }
    .enemy_nodes_label {
        color: #E91E63;
    }
</style>
