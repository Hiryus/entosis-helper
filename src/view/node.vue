<script setup>
    import { ref } from 'vue';

    const { id, expiration } = defineProps({ id: String, expiration: Date||null });
    const counter = ref("...");

    function updateTimer() {
        if(expiration && expiration > new Date()) {
            // Timer ongoing
            const diff = Math.round(Math.abs((expiration - new Date())/1000));
            const minutes = Math.floor(diff/60);
            const seconds = diff % 60;
            counter.value = '(' + minutes + ':' + (seconds >= 10 ? seconds : '0' + seconds) + ')';
        } else if(expiration && expiration <= new Date()) {
            // Timer have ended
            counter.value = '(done)';
        } else {
            // Entosis link must be warming up
            counter.value = '(warm)';
        }
        setTimeout(updateTimer, 1000);
    }
    updateTimer();
</script>

<template>
    <span id="{{ id }}_node">
        <span class="node_name">{{ id }}</span>
        <span class="node_timer">{{ counter }}</span>
    </span>
</template>

<style>
    .node_timer {
        margin: 0 3px;
    }
</style>