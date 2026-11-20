import DotFigure from "@/components/character/DotFigure";
import ArtGallery from "@/components/gallery/ArtGallery";
import Arcade from "@/components/games/Arcade";
import ProjectBrowser from "@/components/projects/ProjectBrowser";
import Fx from "@/components/sections/Fx";
import HardwareBrowser from "@/components/hardware/HardwareBrowser";
import { profile } from "@/data/profile";

export default function HomePage() {
  return (
    <>
      <section id="top" className="stage">
        <div className="stageText">
          <p className="eyebrow">// {profile.fullName}</p>
          <p className="jp" lang="ja">{profile.greetingJp}</p>
          <h1>Minasan, <span>konnichiwa</span></h1>
          <p className="lead">{profile.intro}</p>
          {/* <p className="hint">the dots are alive. move near them or tap.</p> */}
        </div>
        <div className="figureBox"><DotFigure /></div>
      </section>

      <Fx id="about" title="// About" tone="about"><p className="lead">{profile.about}</p></Fx>

      <Fx id="software" title="Software" tone="software" big
        blurb="Apps and games I've built, from terminal experiments to desktop software."
        cta={{ label: "View all projects", href: "https://github.com/MITyung-09" }}>
        <ProjectBrowser />
      </Fx>

      <Fx id="hardware" title="Hardware" tone="hardware" big blurb="Builds, electronics and things I've taken apart and put back together.">
        <HardwareBrowser />
      </Fx>

      <Fx id="arcade" title="Arcade" tone="arcade" big blurb="Little games you can play right here. Scores stay in your browser.">
        <Arcade />
      </Fx>

      <Fx id="art" title="Art" tone="art" big blurb="Sketches, drawings and paintings.">
        <ArtGallery />
      </Fx>
    </>
  );
}
