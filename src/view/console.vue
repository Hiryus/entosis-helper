<script setup>
    const { logs } = defineProps({ logs: Array });
</script>

<template>
    <div class="console">
        <h2>Console</h2>
        <ul>
            <li v-for="message of logs">{{ message}}</li>
        </ul>
    </div>
</template>

<style>
    .console ul {
        list-style: none;
        padding: 0px;
    }
</style>
