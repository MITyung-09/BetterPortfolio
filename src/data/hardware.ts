import type { HardwareCategory, HardwareProject } from "@/types";

export const hardwareCategoryLabels: Record<HardwareCategory, string> = {
  pc: "PC builds",
  components: "Components",
  gadget: "Gadgets",
  electronics: "DIY electronics",
};

// Add a hardware project by copying this example into the array (remove the // marks).
// Put photos in public/hardware. Media can be "image", "video" (mp4) or "youtube" (just the video id).
// {
//   id: "my-pc",
//   name: "My PC build",
//   category: "pc",
//   summary: "One line about it.",
//   description: "A paragraph in your own words: what you made, why, what you learned.",
//   status: "Finished",
//   components: ["Part name", "Another part"],
//   specs: [{ label: "CPU", value: "..." }, { label: "GPU", value: "..." }],
//   log: ["Day 1: ...", "Day 2: ..."],
//   links: [{ label: "Parts list", url: "https://..." }],
//   media: [{ type: "image", src: "/hardware/my-pc-1.jpg", alt: "Finished build" }],
// },
export const hardwareProjects: HardwareProject[] = [
  {
    id: "custom-build-pc",
    name: "Custom Build PC",
    category: "pc",
    summary: "A high-performance rig, mostly used for highly questionable productivity.",
    components: ["Ryzen 7 7700", "PNY RTX 5060", "Mantra 16GB DDR5", "Gigabyte B650M D3HP"],
    specs: [
      { label: "CPU", value: "AMD Ryzen 7 7700" },
      { label: "GPU", value: "PNY GeForce RTX 5060" },
      { label: "RAM", value: "Mantra 16GB DDR5" },
      { label: "Motherboard", value: "Gigabyte B650M D3HP" },
      { label: "Storage", value: "Micron 512GB Gen4 NVMe" },
      { label: "Case", value: "ANT Esports ICE 110 ATX" },
      { label: "PSU", value: "Axcends Nova G Series 750W" },
      { label: "Cooler", value: "Huntkey Storm T629 Fantasy, dual ARGB" },
    ],
    media: [{ type: "image", src: "/hardware/custom-build-pc.webp", alt: "My custom PC build with green lighting, an RTX 5060 and a dual-tower cooler, seen through the side panel" }],
  },
];
