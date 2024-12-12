/*
Author: Scriptone
Description: This code utilises the library from ex1. It provides functions to format code, lint code, and remove logs from the editor input. It also uses Tauri API to communicate with the Rust backend for code formatting and linting.
created:  2024/12/12
*/

// Import the core Tauri API for communication with the backend
import { invoke } from "@tauri-apps/api/core";

// Import a toast for user notifications
import { toast } from "vuetify-sonner";
import { stripInput, stripLoggingStatements } from "./ex1";

// Use pinia defineStore to create a store for managing editor state across components
export const useEditorStore = defineStore("editors", () => {
  // Use the useSettingsStore to access the default language configuration
  const settingsStore = useSettingsStore();

  // Define a reactive editors array with a single editor object placeholder
  const editors = ref<Editor[]>([
    {
      input: "",
      collapsed: false,
      selected: false,
      lang: settingsStore.defaultLanguage,
    },
  ]);

  // Check if the application is running in Tauri
  const tauri = isTauri();

  // Function to add a new editor object to the editors array with default values
  const addEditor = (
    editor: Editor = { input: "", collapsed: false, selected: false }
  ) => {
    // Set the language of the new editor to the default language from settings if not specified
    editor.lang ??= settingsStore.defaultLanguage;
    editors.value.push(editor);
  };

  const resetEditors = () => {
    // reset -> resets 🤷‍♀️
    editors.value = [];
    addEditor();
  };

  const toggleCollapse = (editor: Editor) => {
    editor.collapsed = !editor.collapsed;
  };

  const removeEditor = (editor: Editor) => {
    const index = editors.value.indexOf(editor);
    // Remove the editor at the specified index
    editors.value.splice(index, 1);

    toast.info("Editor removed");
  };

  const formatCode = async (editor: Editor) => {
    if (!tauri) return;

    // Call the format_code endpoint in the backend with the Lua code from the editor, and update the editor input with the formatted code
    // Using try-catch to handle any errors that might occur during the API call
    try {
      const code = editor.input;
      const result = await invoke<string>("format_code", {
        luaCode: code,
      });

      editor.input = result;
      toast.success("Code formatted");
    } catch (error) {
      console.log("Error formatting code:", error);
      toast.error("Error formatting code");
    }
  };

  //Idem dito for linting.
  const lintCode = async (editor: Editor) => {
    if (!tauri) return;

    try {
      const code = editor.input;
      const result = await invoke<string>("lint_code", {
        luaCode: code,
      });

      // Add a new editor with the linted result, do u have suggestions for a different approach?
      addEditor({
        input: result,
        collapsed: false,
        selected: false,
        title: "Linted Result",
      });
      toast.success("Code linted");
    } catch (error) {
      console.log("Error linting code:", error);
      toast.error("Error linting code");
    }
  };
  const stripCode = (editor: Editor) => {
    // Strip the input code of comments and whitespace
    editor.input = stripInput(editor);
    toast.success("Stripped code");
  };

  const removeLogs = (editor: Editor) => {
    editor.input = stripLoggingStatements(editor.input, editor.lang);
    toast.success("Logs removed");
  };

  //Expose the functions to the components
  return {
    editors,
    addEditor,
    resetEditors,
    toggleCollapse,
    removeEditor,
    formatCode,
    lintCode,
    stripCode,
    removeLogs,
  };
});
