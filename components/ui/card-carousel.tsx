"use client"

import React from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"

import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules"

interface CarouselProps {
  images: { src: string; alt: string }[]
  autoplayDelay?: number
  showPagination?: boolean
  showNavigation?: boolean
}

export const CardCarousel: React.FC<CarouselProps> = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right {
    background: none;
  }
  .swiper-pagination-bullet {
    background: rgba(255,255,255,0.4) !important;
  }
  .swiper-pagination-bullet-active {
    background: #aaee20 !important;
  }
  .swiper-button-next, .swiper-button-prev {
    color: #aaee20 !important;
  }
  `
  return (
    <section className="w-full">
      <style>{css}</style>
      <div className="w-full">
        <Swiper
          spaceBetween={50}
          autoplay={{ delay: autoplayDelay, disableOnInteraction: false }}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={"auto"}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
          pagination={showPagination}
          navigation={showNavigation}
          modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="size-full rounded-3xl overflow-hidden">
                <Image
                  src={image.src}
                  width={500}
                  height={750}
                  className="size-full rounded-xl object-cover"
                  alt={image.alt}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}
