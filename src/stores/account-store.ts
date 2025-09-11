
import { type AuthAccount } from "app/src-electron/auth/AuthAccount";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAccountStore = defineStore('accountStore', () => {
  const account = ref<AuthAccount>();


  const hasAccount = computed( () => {
    return account.value !== undefined;
  });



  return {
    account,
    hasAccount,
  };
});
