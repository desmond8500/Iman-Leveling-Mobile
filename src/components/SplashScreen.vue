<template>
  <transition name="splash-fade">
    <div v-if="visible" class="splash" role="presentation">
      <img class="logo" src="/icon-512.png" alt="" width="144" height="144" />
      <h1 class="title">Iman Leveling</h1>
      <p class="subtitle">Monte en niveau, une Hasana à la fois</p>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{ duration?: number }>(), { duration: 1800 });

const visible = ref(true);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});
</script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: radial-gradient(circle at 50% 38%, #1b6b56 0%, #0f3a31 55%, #06100e 100%);
  color: #fff;
}
.logo {
  border-radius: 32px;
  box-shadow: 0 0 40px rgba(242, 201, 76, 0.35);
  animation: pop 0.9s ease-out both;
}
.title {
  margin: 12px 0 0;
  font-size: 26px;
  letter-spacing: 1px;
  color: var(--iman-gold, #f2c94c);
  animation: rise 0.8s 0.3s ease-out both;
}
.subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--iman-text-soft, #9fbdb3);
  animation: rise 0.8s 0.5s ease-out both;
}
.splash-fade-leave-active {
  transition: opacity 0.5s ease;
}
.splash-fade-leave-to {
  opacity: 0;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
