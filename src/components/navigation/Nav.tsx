import SocialIcons from "./SocialIcons";
import ThemeToggle from "./ThemeToggle";

const links = [
  ["Home", "top"], ["About", "about"], ["Software", "software"], ["Hardware", "hardware"],
  ["Arcade", "arcade"], ["Art", "art"],
];

// Sticky (see .nav in globals.css), so it stays at the top while you scroll.
export default function Nav() {
  return (
    <header className="nav">
      <a href="#top" className="logo">Mityung</a>
      <nav aria-label="Main">
        {links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <div className="navRight">
        <SocialIcons />
        <ThemeToggle />
      </div>
    </header>
  );
}
