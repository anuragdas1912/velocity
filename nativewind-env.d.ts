/// <reference types="nativewind/types" />

declare module "*.css" {
  const content: any;
  export default content;
}

declare module 'lucide-react-native' {
  import { FC } from 'react';
  import { SvgProps } from 'react-native-svg';
  export interface LucideProps extends SvgProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    style?: any;
  }
  export const Cpu: FC<LucideProps>;
  export const Compass: FC<LucideProps>;
  export const Target: FC<LucideProps>;
  export const Globe: FC<LucideProps>;
  export const Shield: FC<LucideProps>;
  export const Zap: FC<LucideProps>;
  export const ShoppingBag: FC<LucideProps>;
  export const Flame: FC<LucideProps>;
  export const ArrowLeftRight: FC<LucideProps>;
  export const ChevronDown: FC<LucideProps>;
  export const EyeOff: FC<LucideProps>;
  export const Info: FC<LucideProps>;
  export const Award: FC<LucideProps>;
  export const TrendingUp: FC<LucideProps>;
  export const ChevronUp: FC<LucideProps>;
}
