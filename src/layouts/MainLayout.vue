<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <!-- <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar> -->
      <q-bar class="q-electron-drag">

          <div>
              <span class="q-electron-title" v-if="! accountStore.hasAccount"> <q-btn @click="login" icon="login">Login</q-btn></span>
              <span class="q-electron-title" v-if="accountStore.hasAccount">{{ accountStore.account?.name }} </span>
          </div>

          <q-space />
          <q-btn @click="logout" icon="logout"  v-if="accountStore.hasAccount">Logout</q-btn>
          <q-btn dense flat icon="minimize" @click="minimize" />
          <q-btn dense flat icon="crop_square" @click="toggleMaximize" />
          <q-btn dense flat icon="close" @click="closeApp" />
      </q-bar>

      <!-- Menu Bar -->
      <div class="q-pa-sm q-pl-md row items-center" v-if="accountStore.hasAccount">
          <div class="cursor-pointer non-selectable">
            File
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item clickable v-close-popup>
                  <q-item-section @click="login">Login</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>Open...</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>New</q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable>
                  <q-item-section>Preferences</q-item-section>
                  <q-item-section side>
                    <q-icon name="keyboard_arrow_right" />
                  </q-item-section>

                  <q-menu anchor="top end" self="top start">
                    <q-list>
                      <q-item
                        v-for="n in 3"
                        :key="n"
                        dense
                        clickable
                      >
                        <q-item-section>Submenu Label</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <q-menu auto-close anchor="top end" self="top start">
                          <q-list>
                            <q-item
                              v-for="n in 3"
                              :key="n"
                              dense
                              clickable
                            >
                              <q-item-section>3rd level Label</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup>
                  <q-item-section @click="closeApp()">Quit</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>

          <div class="q-ml-md cursor-pointer non-selectable">
            Edit
            <q-menu auto-close>
              <q-list dense style="min-width: 100px">
                <q-item clickable>
                  <q-item-section>Cut</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Copy</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Paste</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable>
                  <q-item-section>Select All</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';


const linksList: EssentialLinkProps[] = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
];

const leftDrawerOpen = ref(false);

import type WindowIPC from 'src/ipc/window';
import type AuthIPC from 'src/ipc/auth';
import { useAccountStore } from 'src/stores/account-store';

const accountStore = useAccountStore();
const authipc = window as unknown as AuthIPC;
const windowipc = window as unknown as WindowIPC;


function minimize () {
  if (process.env.MODE === 'electron') {
    windowipc.ipcWindow.minimize()
  }
}

function toggleMaximize () {
  if (process.env.MODE === 'electron') {
    windowipc.ipcWindow.toggleMaximize()
  }
}

function closeApp () {
  console.info('closeApp()');
  if (process.env.MODE === 'electron') {
    windowipc.ipcWindow.close()
  }
}

function login() {

  if (process.env.MODE === 'electron') {
    authipc.ipcAuth.login()
    .then((account) => {
      if (account) {
        console.info('Login successful');
        accountStore.account = account;
      }
    }).catch((error) => {
      console.error('Login failed:', error);
    });
  }
}

function logout() {
  if (process.env.MODE === 'electron') {
    authipc.ipcAuth.logout()
    .then(() => {
      console.info('Logout successful');
      accountStore.account = undefined;
    }).catch((error) => {
      console.error('Logout failed:', error);
    });
  }
}

</script>
