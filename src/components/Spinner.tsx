import {DotLottieWorker} from '@lottiefiles/dotlottie-web';
import dotLottieWasm from '@lottiefiles/dotlottie-web/dist/dotlottie-player.wasm?url';
import spinnerLottie from '@/lottie/spinner.lottie?arraybuffer';
import type {DataComponentProps} from '@/types';
import {useEffect, useRef} from 'react';

DotLottieWorker.setWasmUrl(new URL(dotLottieWasm, import.meta.url).href);

export const Spinner = ({...rest}: DataComponentProps<'div'>) => {
  const dotLottieRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (dotLottieRef.current) {
      new DotLottieWorker({
        canvas: dotLottieRef.current,
        data: spinnerLottie,
        loop: true,
        autoplay: true,
      });
    }
  }, []);

  return (
    <div {...rest}>
      <canvas ref={dotLottieRef} className="w-full h-full" />
    </div>
  );
};
