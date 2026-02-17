"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { Autoplay, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";

import { Button } from "@/components/ui/button";

import "swiper/css";

export type HomepageSlide = {
  title: string;
  description: string;
  imageUrl: string;
  ctaHref?: string;
  ctaLabel?: string;
};

type HomepageSliderProps = {
  slides: HomepageSlide[];
};

export function HomepageSlider({ slides }: HomepageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const slideToIndex = (index: number) => {
    swiperRef.current?.slideToLoop(index);
  };

  const handleKeyboardNavigation = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      swiperRef.current?.slideNext();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      swiperRef.current?.slidePrev();
    }
  };

  return (
    <div
      className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
      role="region"
      aria-label="Homepage featured slides"
      tabIndex={0}
      onKeyDown={handleKeyboardNavigation}
      onMouseEnter={() => swiperRef.current?.autoplay.stop()}
      onMouseLeave={() => swiperRef.current?.autoplay.start()}
      onFocusCapture={() => swiperRef.current?.autoplay.stop()}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          swiperRef.current?.autoplay.start();
        }
      }}
      onPointerDown={() => swiperRef.current?.autoplay.stop()}
      onPointerUp={() => swiperRef.current?.autoplay.start()}
    >
      {/* Swiper stays lightweight here and already handles touch swipe + mouse drag reliably. */}
      <Swiper
        modules={[Autoplay, A11y]}
        autoplay={slides.length > 1 ? { delay: 4000, pauseOnMouseEnter: true, disableOnInteraction: false } : false}
        loop={slides.length > 1}
        speed={600}
        onSwiper={(instance) => {
          swiperRef.current = instance;
        }}
        onSlideChange={(instance) => {
          setActiveIndex(instance.realIndex);
        }}
      >
        {slides.map((slide, index) => {
          const href = slide.ctaHref || "/models";

          return (
            <SwiperSlide key={`${slide.title}-${index}`}>
              <article className="relative min-h-[420px] md:min-h-[520px]">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(110deg, rgba(7, 18, 36, 0.78), rgba(7, 18, 36, 0.28)), url(${slide.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="relative z-10 flex min-h-[420px] items-end p-8 md:min-h-[520px] md:p-14">
                  <div className="max-w-2xl">
                    <h1 className="font-display mt-3 text-4xl leading-tight font-semibold text-white md:text-6xl">{slide.title}</h1>
                    <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">{slide.description}</p>
                    {slide.ctaLabel ? (
                      <Link href={href} className="mt-7 inline-flex">
                        <Button size="lg">{slide.ctaLabel}</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {slides.length > 1 ? (
        <div className="flex items-center justify-center gap-2 bg-card/95 px-4 py-3">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={`slide-dot-${index}`}
                type="button"
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                aria-current={isActive}
                onClick={() => slideToIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${isActive ? "bg-primary" : "bg-muted-foreground/35 hover:bg-muted-foreground/60"}`}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
