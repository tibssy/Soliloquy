export type ModelDef = {
    id: string;
    name: string;
    description: string;
    sizeStr: string;
    filename: string;
    url: string;
};

export const AVAILABLE_MODELS: ModelDef[] = [
    {
        id: "gemma-270m",
        name: "Gemma 3 270M",
        description: "Ultra-lightweight, fast instruction model.",
        sizeStr: "270 MB",
        filename: "gemma-3-270m-it-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/gemma-3-270m-it-GGUF/resolve/main/gemma-3-270m-it-Q4_K_M.gguf?download=true",
    },
    {
        id: "gemma-1b",
        name: "Gemma 3 1B",
        description: "Balanced performance and speed.",
        sizeStr: "800 MB",
        filename: "gemma-3-1b-it-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf?download=true",
    },
    {
        id: "llama-3.2-1b",
        name: "Llama 3.2 1B",
        description: "Meta's latest efficient small model.",
        sizeStr: "808 MB",
        filename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf?download=true",
    },
    {
        id: "Llama-3.2-3B",
        name: "Llama 3.2 3B",
        description: "Meta's latest efficient small model.",
        sizeStr: "2.02 GB",
        filename: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf?download=true",
    },
];

export const getModelNameById = (id: string | null): string => {
    if (!id) return "Select Model";
    const model = AVAILABLE_MODELS.find((m) => m.id === id);
    return model ? model.name : id;
};
