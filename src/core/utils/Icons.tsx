/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as BsIcons from "react-icons/bs";
import * as CgIcons from "react-icons/cg";
import * as CiIcons from "react-icons/ci";
import * as DiIcons from "react-icons/di";
import * as FaIcons from "react-icons/fa";
import * as FiIcons from "react-icons/fi";
import * as Fa6Icons from "react-icons/fa6";
import * as FcIcons from "react-icons/fc";
import * as GiIcons from "react-icons/gi";
import * as GoIcons from "react-icons/go";
import * as GrIcons from "react-icons/gr";
import * as HiIcons from "react-icons/hi";
import * as Hi2Icons from "react-icons/hi2";
import * as ImIcons from "react-icons/im";
import * as IoIcons from "react-icons/io";
import * as Io5Icons from "react-icons/io5";
import * as LiaIcons from "react-icons/lia";
import * as LibIcons from "react-icons/lib";
import * as LuIcons from "react-icons/lu";
import * as MdIcons from "react-icons/md";
import * as PiIcons from "react-icons/pi";
import * as RiIcons from "react-icons/ri";
import * as RxIcons from "react-icons/rx";
import * as SiIcons from "react-icons/si";
import * as SlIcons from "react-icons/sl";
import * as TbIcons from "react-icons/tb";
import * as TfiIcons from "react-icons/tfi";
import * as TiIcons from "react-icons/ti";
import * as VscIcons from "react-icons/vsc";
import * as WiIcons from "react-icons/wi";

// 1. Create type for all library keys
export type IconLibrary =
  | "ai"
  | "bi"
  | "bs"
  | "cg"
  | "ci"
  | "di"
  | "fa"
  | "fi"
  | "fa6"
  | "fc"
  | "gi"
  | "go"
  | "gr"
  | "hi"
  | "hi2"
  | "im"
  | "io"
  | "io5"
  | "lia"
  | "lib"
  | "lu"
  | "md"
  | "pi"
  | "ri"
  | "rx"
  | "si"
  | "sl"
  | "tb"
  | "tfi"
  | "ti"
  | "vsc"
  | "wi" | string;

// 2. Map each lib to its imports
const libraries: Record<IconLibrary, any> = {
  ai: AiIcons,
  bi: BiIcons,
  bs: BsIcons,
  cg: CgIcons,
  ci: CiIcons,
  di: DiIcons,
  fa: FaIcons,
  fi: FiIcons,
  fa6: Fa6Icons,
  fc: FcIcons,
  gi: GiIcons,
  go: GoIcons,
  gr: GrIcons,
  hi: HiIcons,
  hi2: Hi2Icons,
  im: ImIcons,
  io: IoIcons,
  io5: Io5Icons,
  lia: LiaIcons,
  lib: LibIcons,
  lu: LuIcons,
  md: MdIcons,
  pi: PiIcons,
  ri: RiIcons,
  rx: RxIcons,
  si: SiIcons,
  sl: SlIcons,
  tb: TbIcons,
  tfi: TfiIcons,
  ti: TiIcons,
  vsc: VscIcons,
  wi: WiIcons,
};

// 3. Props type
interface IconProps {
  lib: IconLibrary;
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

// 4. Component
const Icon: React.FC<IconProps> = ({
  lib,
  name,
  size = 24,
  color = "currentColor",
  className,
}) => {
  const Library = libraries[lib];
  const Component = Library?.[name];

  if (!Component) {
    console.warn(`⚠️ Icon "${name}" not found in "${lib}" library`);
    return null;
  }

  return <Component size={size} color={color} className={className} />;
};

export default Icon;
