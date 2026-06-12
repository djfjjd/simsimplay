const bannerBaseClass = [
  "pointer-events-auto fixed top-32 z-20 hidden h-[min(600px,calc(100vh-10rem))] w-40",
  "items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]",
  "text-xs font-black text-slate-500 shadow-xl shadow-black/20 backdrop-blur-sm",
  "min-[1400px]:flex min-[1920px]:w-[300px]",
].join(" ");

export function AdSenseSideBanners() {
  return (
    <aside aria-label="광고 영역" className="pointer-events-none">
      <div className={`${bannerBaseClass} left-4 min-[1500px]:left-8`}>
        {/* AdSense 승인 후 광고 단위 코드를 이 위치에 삽입하세요.
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5217418488676415"
            data-ad-slot="AD_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        */}
        광고
      </div>

      <div className={`${bannerBaseClass} right-4 min-[1500px]:right-8`}>
        {/* AdSense 승인 후 광고 단위 코드를 이 위치에 삽입하세요.
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5217418488676415"
            data-ad-slot="AD_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        */}
        광고
      </div>
    </aside>
  );
}
