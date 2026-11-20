import type { Category, Project } from "@/types";

export const categoryLabels: Record<Category, string> = {
  desktop: "Desktop apps",
  game: "Games",
};

// Add a project by copying a block. Screenshots/videos: put files in public/projects and add
// media: [{ type: "image", src: "/projects/cashora-1.png", alt: "Dashboard" }]
export const projects: Project[] = [
  {
    id: "cashora",
    name: "Cashora",
    summary: "A desktop finance application built with C# and WPF.",
    categories: ["desktop"],
    tech: ["C#", ".NET 10", "WPF", "MVVM", "CommunityToolkit.Mvvm", "WPF-UI", "LiveCharts2", "SQLite", "Dapper"],
    status: "Completed",
    github: "https://github.com/MITyung-09/Cashora",
  },
  {
    id: "the-survivors",
    name: "The Survivors",
    summary: "A top-down 2D survival game set in a snowy, dark fantasy world.",
    categories: ["game"],
    tech: ["Unity", "C#"],
    status: "Completed",
    // github: add the real repository URL here
    details: ["Kratos-inspired and Draugr-inspired elements", "Snowy survival with a dark fantasy mood"],
  },
  {
    id: "zombie-survival-shooter",
    name: "Retro Zombie Survival Shooter",
    summary: "A console action-RPG in C++ where you fight waves of zombies, drawn entirely in ASCII.",
    categories: ["game"],
    tech: ["C++", "ASCII graphics"],
    status: "Completed",
    details: [
      "Directional shooting, power-ups, XP and levelling",
      "Boss zombies and a choice of difficulty levels",
      "No game engine or graphics library, just standard C++",
    ],
  },
  {
    id: "ascii-flappy-bird",
    name: "ASCII Flappy Bird",
    summary: "A Flappy Bird game written in C that runs in the terminal.",
    categories: ["game"],
    tech: ["C", "ASCII graphics"],
    status: "Completed",
  },
];
