import { MapGuessingGame } from "./components/map-guessing-game";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center p-12 gap-12">

      {/* Heading */}
      <div className="text-4xl text-center font-bold">
        Fine-Tuning CLIP For Global Geocell Classification
      </div>

      {/* Description */}
      <div className="text-sm text-muted-foreground text-left font-semibold max-w-6xl">
        This demo showcases a fine-tuned CLIP model (frozen visual encoder + linear layer) for global geocell classification. 
        This CLIP-based model predicts H3 geocells (resolution 2 shown) and was trained on ~180k street-view images sampled from the OSV-5M benchmark dataset, spanning 90 countries across the globe.
        Training was done on an Intel Arc B580 GPU, using PyTorch (see <a href="https://github.com/raheemmir/GeoGuessrVisionModels" target="_blank" rel="noreferrer" className="underline hover:text-foreground transition-colors">repo</a>). <span className="italic font-extrabold">Test your geolocation skills against the fine-tuned CLIP model in the GeoGuessr-style game below!</span>
      </div>

      {/* The Demo Itself */}
      <MapGuessingGame/>

    </div>
  );
}

export default App;
