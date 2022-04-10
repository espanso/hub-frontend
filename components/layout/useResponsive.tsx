import { useEffect, useState } from "react";
import { constant, pipe } from "fp-ts/function";
import { array, option } from "fp-ts";

type Breakpoint = "xs" | "s" | "m" | "l" | "xl" | "xxl";

type Device = "mobile" | "tablet" | "desktop";

const foldBreakpointsInternal: <T>(
  match: Record<Breakpoint, () => T>
) => (breakpoint: Breakpoint) => T = (match) => (breakpoint) =>
  match[breakpoint]();

const breakpoints: Array<[Breakpoint, number]> = [
  ["xxl", 1400],
  ["xl", 1200],
  ["l", 992],
  ["m", 768],
  ["s", 576],
  ["xs", 0],
];

export const useResponsive = () => {
  const [width, setWidth] = useState<number>(1400);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    handleWindowSizeChange();
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);

  const breakpoint: Breakpoint = pipe(
    breakpoints,
    array.findFirst((bkp) => width >= bkp[1]),
    option.map((bkp) => bkp[0]),
    option.getOrElse(constant("xs" as Breakpoint))
  );

  const device: Device = pipe(
    breakpoint,
    foldBreakpointsInternal({
      xs: () => "mobile",
      s: () => "mobile",
      m: () => "tablet",
      l: () => "desktop",
      xl: () => "desktop",
      xxl: () => "desktop",
    })
  );

  const foldBreakpoints: <T>(match: Record<Breakpoint, () => T>) => T = (
    match
  ) => foldBreakpointsInternal(match)(breakpoint);

  const foldDevices: <T>(match: Record<Device, () => T>) => T = (match) =>
    match[device]();

  return {
    breakpoint,
    foldBreakpoints,
    device,
    foldDevices,
  };
};
