"use client";
import { useEffect, useState } from "react";

/** True below Tailwind's md breakpoint, where popovers on the table become bottom sheets. */
export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(max-width: 47.99rem)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}
