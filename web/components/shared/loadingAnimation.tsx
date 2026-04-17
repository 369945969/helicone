import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

import chickyRaw from "../../public/lottie/Polite Chicky.json";
import hamsterRaw from "../../public/lottie/Aniki Hamster.json";
import planeRaw from "../../public/lottie/Paper Airplane.json";
import PartyParrotRaw from "../../public/lottie/PartyParrot.json";
import PacmanRaw from "../../public/lottie/Pacman.json";
import CubeRaw from "../../public/lottie/cube.json";

// Clone animation data to avoid React 19 frozen object issues
const chicky = JSON.parse(JSON.stringify(chickyRaw));
const hamster = JSON.parse(JSON.stringify(hamsterRaw));
const plane = JSON.parse(JSON.stringify(planeRaw));
const PartyParrot = JSON.parse(JSON.stringify(PartyParrotRaw));
const Pacman = JSON.parse(JSON.stringify(PacmanRaw));
const Cube = JSON.parse(JSON.stringify(CubeRaw));

type Animation =
  | typeof chicky
  | typeof hamster
  | typeof plane
  | typeof PartyParrot
  | typeof Pacman;

interface LoadingAnimationProps {
  title?: string;
  height?: number;
  width?: number;
  animation?: Animation;
}

const LoadingAnimation = ({
  title,
  animation: defaultAnimation,
  height = 300,
  width = 300,
}: LoadingAnimationProps) => {
  const animation = defaultAnimation || Cube;

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-4 align-middle">
      <Lottie animationData={animation} style={{ height, width }} loop={true} />
      {title && (
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {title}
        </p>
      )}
    </div>
  );
};

export default LoadingAnimation;
