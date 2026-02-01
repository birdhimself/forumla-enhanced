<script setup lang="ts">
import { useAddonStore } from "../stores/addon";

const addonStore = useAddonStore();

const props = defineProps({
  prop: {
    type: String,
    required: true,
  },
  experimental: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>

<template>
  <v-list-item
    v-bind="$attrs"
    @click="addonStore.toggleItem(props.prop)"
    color="red"
  >
    <template #prepend>
      <v-list-item-action class="d-flex flex-column">
        <v-checkbox-btn
          :model-value="addonStore.storage[props.prop]"
          color="primary"
        />
      </v-list-item-action>
    </template>
    <v-list-item-media v-if="experimental" class="text-caption text-red">
      Experimentell
    </v-list-item-media>
  </v-list-item>
</template>
