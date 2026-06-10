import { useEffect, useRef } from "react";
import type { DataComponentProps } from "@/types";
import { DotLottieWorker } from "@lottiefiles/dotlottie-web";
import dotLottieWasm from "@lottiefiles/dotlottie-web/dotlottie-player.wasm?url";
import spinnerLottie from "@/lottie/spinner.lottie?arraybuffer";

DotLottieWorker.setWasmUrl(new URL(dotLottieWasm, import.meta.url).href);

export const Spinner = ({ ...rest }: DataComponentProps<"div">) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // A canvas can only be transferred to a worker once, so each effect run
  // (StrictMode, Activity reveal) must build a fresh canvas element.
  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.className = "w-full h-full";
    container.append(canvas);

    const dotLottieInstance = new DotLottieWorker({
      canvas,
      data: spinnerLottie,
      loop: true,
      autoplay: true,
    });

    return () => {
      dotLottieInstance.destroy();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} {...rest} />;
};
