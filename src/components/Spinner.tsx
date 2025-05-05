import {useEffect, useRef} from 'react';
import type {DataComponentProps} from '@/types';
import {DotLottieWorker} from '@lottiefiles/dotlottie-web';
import dotLottieWasm from '@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm?url';
import spinnerLottie from '@/lottie/spinner.lottie?arraybuffer';

DotLottieWorker.setWasmUrl(new URL(dotLottieWasm, import.meta.url).href);

export const Spinner = ({...rest}: DataComponentProps<'div'>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotLottieInstanceRef = useRef<DotLottieWorker | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      dotLottieInstanceRef.current = new DotLottieWorker({
        canvas: canvasRef.current,
        data: spinnerLottie,
        loop: true,
        autoplay: true,
      });
    }

    return () => {
      dotLottieInstanceRef.current?.destroy();
    };
  }, []);

  return (
    <div {...rest}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};
