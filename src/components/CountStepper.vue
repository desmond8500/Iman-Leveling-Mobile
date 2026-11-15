<template>
  <div class="row">
    <span class="label">{{ label }}</span>
    <div class="stepper">
      <button type="button" :disabled="modelValue <= 0" :aria-label="`Retirer : ${label}`" @click="$emit('update:modelValue', modelValue - 1)">−</button>
      <span class="value" aria-live="polite">{{ modelValue }}</span>
      <button type="button" :disabled="modelValue >= max" :aria-label="`Ajouter : ${label}`" @click="$emit('update:modelValue', modelValue + 1)">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label: string; modelValue: number; max?: number }>(), { max: 30 });
defineEmits<{ (e: 'update:modelValue', value: number): void }>();
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
}
.label {
  flex: 1;
  font-size: 14px;
}
.stepper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stepper button {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(242, 201, 76, 0.4);
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font-size: 18px;
}
.stepper button:disabled {
  opacity: 0.35;
}
.value {
  min-width: 22px;
  text-align: center;
  font-weight: 700;
}
</style>
