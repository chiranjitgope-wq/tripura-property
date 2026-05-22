<section className="px-4 pt-4">
  <div className="mx-auto max-w-6xl overflow-hidden rounded-[30px] shadow-2xl">
    <div className="relative h-[260px] sm:h-[420px]">
      {bannerSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          <div className="absolute bottom-0 left-0 p-6 sm:p-10 text-white">
            <p className="mb-3 inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur-sm">
              {slide.category.toUpperCase()}
            </p>

            <h2 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
              {slide.title}
            </h2>

            <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-lg">
              {slide.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={slide.link}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg"
              >
                Explore Now
              </Link>

              <Link
                href="/properties"
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {bannerSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === index
                ? "w-8 bg-white"
                : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  </div>
</section>