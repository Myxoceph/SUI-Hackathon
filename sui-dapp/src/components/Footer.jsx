import { APP_VERSION } from "@/constants/navigation";

const Footer = () => (
  <footer className="border-t border-border py-6 md:py-0">
    <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
        Built for Sui Hackathon. Inspired by 42.
      </p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{APP_VERSION}</span>
        <div className="h-4 w-[1px] bg-border" />
        <span className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          System Operational
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
