import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default [
    js.configs.recommended,
    ...vue.configs["flat/essential"],
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2021,
                defineProps: "readonly",
                defineEmits: "readonly",
                withDefaults: "readonly",
                h: "readonly",
                vue: "readonly",
                ref: "readonly",
                reactive: "readonly",
                computed: "readonly",
                watch: "readonly",
                provide: "readonly",
                inject: "readonly",
                defineComponent: "readonly",
                onBeforeMount: "readonly",
                onMounted: "readonly",
                onBeforeUnmount: "readonly",
                nextTick: "readonly",
                ElMessage: "readonly",
                $openList: "readonly"
            }
        },
        rules: {
            "vue/multi-word-component-names": "off"
        }
    }
];
