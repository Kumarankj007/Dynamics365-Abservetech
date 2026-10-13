type FontSizeKey = "73" | "67" | "50" | "45" | "40" | "30" | "24" | "20" | "17" | "14";
type WeightKey = "N" | "SB" | "B";

const baseFonts: Record<FontSizeKey, string> = {
  "73": " lg:text-[73px] md:text-[60px] sm:text-[50px] text-[40px]",
  "67": " lg:text-[67px] md:text-[56px] sm:text-[46px] text-[30px]",
  "50": " lg:text-[50px] md:text-[42px] sm:text-[35px] text-[28px]",
  "45": " lg:text-[45px] md:text-[37px] sm:text-[32px] text-[27px]",
  "40": " lg:text-[40px] md:text-[35px] sm:text-[30px] text-[25px]",
  "30": " lg:text-[30px] md:text-[25px] text-[20px]",
  "24": " lg:text-[24px] md:text-[20px] text-[18px]",
  "20": " lg:text-[20px] md:text-[18px] text-[16px]",
  "17": " md:text-[17px] text-[15px]",
  "14": " text-[14px]",
};

const weight: Record<WeightKey, string> = {
  N: "font-normal ",
  SB: "font-semibold ",
  B: "font-bold ",
};

// 🔑 Generate fonts automatically
export const fonts: Record<string, string> = Object.fromEntries(
  Object.entries(baseFonts).flatMap(([size, font]) =>
    Object.entries(weight).map(([wKey, wVal]) => [
      `${wKey}_${size}`, // e.g., "SB_45"
      `${font} ${wVal}`,
    ])
  )
);
