import React, { createContext, useContext, useState } from "react";
import { initLlama, LlamaContext } from "llama.rn";
import { File, Directory, Paths } from "expo-file-system";

type LlamaContextType = {
    isModelLoaded: boolean;
    isModelLoading: boolean;
    loadingProgress: number;
    activeModelId: string | null;
    loadModel: (modelFilename: string, modelId: string) => Promise<void>;
    unloadModel: () => Promise<void>;
    llama: LlamaContext | null;
};

const LlamaAppContext = createContext<LlamaContextType>({
    isModelLoaded: false,
    isModelLoading: false,
    loadingProgress: 0,
    activeModelId: null,
    loadModel: async () => {},
    unloadModel: async () => {},
    llama: null,
});

export const LlamaProvider = ({ children }: { children: React.ReactNode }) => {
    const [llama, setLlama] = useState<LlamaContext | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [activeModelId, setActiveModelId] = useState<string | null>(null);

    const modelsDir = new Directory(Paths.document, "models");

    const unloadModel = async () => {
        if (llama) {
            await llama.release();
            setLlama(null);
            setActiveModelId(null);
        }
    };

    const loadModel = async (modelFilename: string, modelId: string) => {
        if (isModelLoading) return;

        try {
            if (llama) {
                await unloadModel();
            }

            setIsModelLoading(true);
            setLoadingProgress(0.1);

            const modelFile = new File(modelsDir, modelFilename);

            if (!modelFile.exists) {
                throw new Error("Model file not found");
            }

            const context = await initLlama({
                model: modelFile.uri,
                use_mlock: false,
                n_ctx: 2048,
                n_gpu_layers: 99,
                n_threads: 4,
            });

            setLoadingProgress(1.0);
            setLlama(context);
            setActiveModelId(modelId);
        } catch (err) {
            console.error("Failed to load model:", err);
            setLoadingProgress(0);
        } finally {
            setIsModelLoading(false);
        }
    };

    return (
        <LlamaAppContext.Provider
            value={{
                isModelLoaded: !!llama,
                isModelLoading,
                loadingProgress,
                activeModelId,
                loadModel,
                unloadModel,
                llama,
            }}
        >
            {children}
        </LlamaAppContext.Provider>
    );
};

export const useLlama = () => useContext(LlamaAppContext);
