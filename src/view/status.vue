<script setup>
    import System from './system.vue';
    const { systems } = defineProps({ systems: Array });
</script>

<template>
    <div class="status">
        <h2 id="status">Status</h2>
        <ul id="system_list">
            <li v-for="system of systems" class="system_block">
                <System :name="system.name" :nodes="system.nodes" />
            </li>
        </ul>
    </div>
</template>

<style>
    #system_list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    .system_block {
        align-self: flex-start;
        border: 2px solid #303F9F;
        border-radius: 15px;
        cursor: pointer;
        display: inline-block;
        margin: 10px auto;
        overflow: hidden;
    }
</style>