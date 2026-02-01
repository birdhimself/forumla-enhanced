<script setup lang="ts">
import {
  mdiCardText,
  mdiFileDocument,
  mdiGithub,
  mdiInformation,
  mdiReload,
  mdiWrench,
} from "@mdi/js";
import { onMounted, ref } from "vue";
import { version } from "../package.json";
import logoWhite from "./assets/logo_white.svg";
import TabInformation from "./components/TabInformation.vue";
import TabLayout from "./components/TabLayout.vue";
import TabPosts from "./components/TabPosts.vue";
import TabTweaks from "./components/TabTweaks.vue";

async function reload() {
  const tabs = await chrome.tabs.query({
    url: "*://*.forumla.de/*",
  });

  for (const tab of tabs) {
    if (!tab.id) {
      continue;
    }

    chrome.tabs.reload(tab.id);
  }
}

const tabs = [
  {
    name: "layout",
    label: "Layout",
    icon: mdiFileDocument,
  },
  {
    name: "posts",
    label: "Posts",
    icon: mdiCardText,
  },
  {
    name: "tweaks",
    label: "Tweaks",
    icon: mdiWrench,
  },
  {
    name: "information",
    label: "Über",
    icon: mdiInformation,
  },
];

const activeTab = ref("layout");

const commitHash = __COMMIT_HASH__;

const originPermissionGranted = ref(true);

onMounted(async () => {
  originPermissionGranted.value = await chrome.permissions.contains({
    origins: ["*://*.forumla.de/*"],
  });
});

function requestOriginPermission() {
  chrome.permissions.request({
    origins: ["*://*.forumla.de/*"],
  });

  // Close the popup because it's above the permission request bubble in
  // Firefox.
  window.close();
}
</script>

<template>
  <v-layout>
    <v-app-bar color="primary" density="compact">
      <v-app-bar-title>
        <img style="height: 38px; padding-top: 8px" :src="logoWhite" />
      </v-app-bar-title>
      <v-btn icon @click="reload">
        <v-icon>{{ mdiReload }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          Lädt alle im Browser geöffneten forumla.de Tabs neu.
        </v-tooltip>
      </v-btn>

      <template #extension>
        <v-tabs v-model="activeTab" grow density="compact" centered stacked>
          <v-tab v-for="tab in tabs" :key="tab.name" :value="tab.name">
            <v-icon>{{ tab.icon }}</v-icon>
            <span class="text-caption">{{ tab.label }}</span>
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <v-alert v-if="!originPermissionGranted" type="warning" class="ma-4">
        <div class="d-flex flex-column" style="gap: 4px">
          <span>Berechtigung zum Zugriff auf forumla.de erforderlich.</span>
          <v-btn @click="requestOriginPermission">Erlauben</v-btn>
        </div>
      </v-alert>
      <v-window v-model="activeTab">
        <v-window-item value="layout">
          <TabLayout />
        </v-window-item>
        <v-window-item value="posts">
          <TabPosts />
        </v-window-item>
        <v-window-item value="tweaks">
          <TabTweaks />
        </v-window-item>
        <v-window-item value="information">
          <TabInformation />
        </v-window-item>
      </v-window>
      <v-footer app class="pa-0 text-caption">
        <div class="px-4 py-2 bg-secondary w-100 d-flex justify-space-between">
          <span>
            Version {{ version }}-{{ commitHash }}, erstellt von
            <a
              href="https://www.forumla.de/u62855/medeman/"
              target="_blank"
              class="text-accent"
            >
              medeman
            </a>
          </span>
          <a
            href="https://github.com/birdhimself/forumla-enhanced"
            title="GitHub"
            target="_blank"
            class="text-white"
          >
            <v-icon>{{ mdiGithub }}</v-icon>
          </a>
        </div>
      </v-footer>
    </v-main>
  </v-layout>
</template>
