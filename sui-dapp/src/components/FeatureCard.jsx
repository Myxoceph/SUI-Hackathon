const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="space-y-4 border border-border p-6 bg-card/30">
    <div className="h-10 w-10 bg-primary/10 flex items-center justify-center border border-primary/20">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="text-xl font-bold font-sans">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

export default FeatureCard;
