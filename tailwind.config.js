/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    screens: {
      sm: "640px", //@media (min-width: 640px) { ... }
      md: "768px", //@media (min-width: 768px) { ... }
      lg: "1024px", //@media (min-width: 1024px) { ... }
      xl: "1280px", //@media (min-width: 1280px) { ... }
      "2xl": "1536px", //@media (min-width: 1536px) { ... }

      // => max media query 
      smMax: {'max': '639px'},// => @media (max-width: 767px) { ... }
      mdMax: {'max': '767px'},// => @media (max-width: 767px) { ... }
      lgMax: {'max': '1023px'},// => @media (max-width: 767px) { ... }
      xlMax: {'max': '1279px'},// => @media (max-width: 767px) { ... }
    },
    colors: {
      // white shades
      iwhite: "#ffffff",

      // black shades
      iblack: "#000000",

      // blue shade
      ibl1: "#052C85",
      ibl2: "#9BACD2",
      ibl3: "#1246BC",
      ibl4: "#B4C2D4",
      ibl5: "#001E63",
      ibl6: "#003CC2",
      ibl7: "#D6E2FF",
      ibl8: "#06349C",
      ibl9: "#0E399C",
      ibl10: "#D8DEFF",
      ibl11: "#011BAB",
      ibl12: "#E6EEFF",
      ibl13: "#0E3A73",
      ibl14: "#11273E",
      ibl15: "#E2EBFF",
      ibl16: "#294FA8",
      ibl17: "#BDCDDE",
      ibl18: "#5C8CFA",
      ibl19: "#121F57",
      ibl20: "#03287B",
      ibl21: "#EAEFF4",
      ibl22: "#03153F",
      ibl23: "#06349CCC",
      ibl24: "#E5EDFF",
      ibl25: "#D2E7FF",
      ibl26: "#BADDFF",
      ibl27: "#417BFC",
      ibl28: "#1358F2",
      ibl29: "#E2E8F0",
      ibl30: "#F0F7FF",
      ibl31: "#f2f3f5",
      ibl32: '#E6F2FF',
      ibl33: '#0085fe',

      // grey Shade
      igy1: "#021526",
      igy2: "#000000",
      igy3: "#1C1B1F",
      igy4: "#545454",
      igy5: "#777777",
      igy6: "#A4A4A4",
      igy7: "#9E9494",
      igy8: "#8A8A8A",
      igy9: "#00000099",
      igy10: "#878787",
      igy11: "#455A64",
      igy12: "#D9D9D9",
      igy13: "#676565",
      igy14: "#ADADAD",
      igy15: "#2D3748",
      igy16: "#767676",
      igy17: "#424242",
      igy18: '#707070',

      // green Shade
      ign1: "#089E61",
      ign2: "#13D284",
      ign3: "#80FCCA",
      ign4: "#0FA266",
      ign5: "#D1F1E4",
      ign6: "#39B100",
      ign7: "#3C991B",

      // orange Shade
      ior1: "#FB8762",
      ior2: "#FFEDE2",
      ior3: "#E97025",
      iro4: "#F48333",
      iro5: "#EA7525",

      // red Shade
      ird1: "#F64242",
      ird2: "#FE4B5C",
      ird3: "#DC0000",
      ird4: "#FEDFE2",
      ird5: "#FDDEE1",

      // purple Shade
      ipr1: "#F1C1F9",
      ipr2: "#C525E1",
    },
  },
  plugins: [],
};
