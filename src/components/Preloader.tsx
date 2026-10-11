import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, lockScroll, prefersReducedMotion } from '../lib/motion';

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    lockScroll(true);
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        lockScroll(false);
        onDone();
      },
    });
    if (prefersReducedMotion) {
      tl.to(root.current, { autoAlpha: 0, duration: 0.3, delay: 0.2 });
    } else {
      tl.to(counter, {
        v: 100,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => setCount(Math.round(counter.v)),
      })
        .to('.pre-line', { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to('.pre-text', { yPercent: -110, duration: 0.6, ease: 'power3.in' }, '+=0.1')
        .to(root.current, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.15');
    }
    return () => {
      tl.kill();
    };
  }, [onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-[80] flex flex-col justify-between bg-bg p-5 md:p-10" aria-hidden="true">
      <div className="line-mask">
        <p className="pre-text eyebrow">Prajwal D L — Portfolio ’26</p>
      </div>
      <div>
        <div className="line-mask">
          <p className="pre-text serif text-[28vw] leading-[0.8] md:text-[16vw]">
            {count}
            <span className="text-accent">%</span>
          </p>
        </div>
        <div className="pre-line mt-6 h-px origin-left scale-x-0 bg-ink/40" />
      </div>
    </div>
  );
}
