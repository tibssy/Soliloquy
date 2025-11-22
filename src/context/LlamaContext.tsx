import React, { createContext, useContext, useState, useRef } from "react";
import { initLlama, LlamaContext } from "llama.rn";
import { File, Directory, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";

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
    const progressValueRef = useRef(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const modelsDir = new Directory(Paths.document, "models");

    const unloadModel = async () => {
        if (llama) {
            await llama.release();
            setLlama(null);
            setActiveModelId(null);
        }
    };

    // Helper: Smoothly animate from CURRENT % to 100% over 1 second
    const animateToCompletion = (): Promise<void> => {
        return new Promise((resolve) => {
            const startValue = progressValueRef.current;
            const remaining = 1.0 - startValue;

            if (remaining <= 0.01) {
                setLoadingProgress(1);
                resolve();
                return;
            }

            const duration = 1000;
            const frames = 20;
            const frameTime = duration / frames;
            const increment = remaining / frames;

            let currentFrame = 0;

            const fastInterval = setInterval(() => {
                currentFrame++;
                const newValue = Math.min(
                    1,
                    startValue + increment * currentFrame
                );

                progressValueRef.current = newValue;
                setLoadingProgress(newValue);

                if (currentFrame >= frames) {
                    clearInterval(fastInterval);
                    resolve();
                }
            }, frameTime);
        });
    };

    const loadModel = async (modelFilename: string, modelId: string) => {
        if (isModelLoading) return;

        try {
            if (llama) {
                await unloadModel();
            }

            setIsModelLoading(true);
            progressValueRef.current = 0.05;
            setLoadingProgress(0.05);

            const modelFile = new File(modelsDir, modelFilename);
            if (!modelFile.exists) {
                throw new Error("Model file not found");
            }

            // --- ESTIMATION LOGIC ---
            const fileInfo = await FileSystemLegacy.getInfoAsync(modelFile.uri);
            const fileSize = fileInfo.exists ? fileInfo.size : 0;
            const estimatedSpeedBytesPerSec = 50 * 1024 * 1024;
            const estimatedDurationMs =
                (fileSize / estimatedSpeedBytesPerSec) * 1000;
            const tickRate = 50;
            const totalTicks = estimatedDurationMs / tickRate;
            const incrementPerTick = 0.9 / totalTicks;

            progressInterval.current = setInterval(() => {
                if (progressValueRef.current < 0.9) {
                    progressValueRef.current += incrementPerTick;
                    setLoadingProgress(progressValueRef.current);
                }
            }, tickRate);

            const context = await initLlama({
                model: modelFile.uri,
                use_mlock: false,
                n_ctx: 2048,
                n_gpu_layers: 99,
                n_threads: 4,
            });

            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }

            await animateToCompletion();

            setLlama(context);
            setActiveModelId(modelId);
        } catch (err) {
            console.error("Failed to load model:", err);
            if (progressInterval.current)
                clearInterval(progressInterval.current);
            setLoadingProgress(0);
        } finally {
            setTimeout(() => {
                setIsModelLoading(false);
            }, 200);
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
