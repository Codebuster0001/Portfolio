import React, { memo } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import * as Fa6Icons from 'react-icons/fa6';
import * as TbIcons from 'react-icons/tb';
import {
  Code2, Database, Layout, Server, Terminal, Wind, Cpu, Globe,
  Cloud, GitBranch, Triangle, FileCode2, Box, Layers,
  Zap, Shield, Rocket, Star, Settings, Monitor, Smartphone,
} from 'lucide-react';

// ============================================================
// Lucide fallback icon map
// ============================================================
const lucideIconMap = {
  Code2, Database, Layout, Server, Terminal, Wind, Cpu, Globe,
  Cloud, GitBranch, Triangle, FileCode2, Box, Layers,
  Zap, Shield, Rocket, Star, Settings, Monitor, Smartphone,
};

// ============================================================
// Library resolvers
// ============================================================
const libraryMap = {
  'react-icons/fa': FaIcons,
  fa: FaIcons,
  'react-icons/si': SiIcons,
  si: SiIcons,
  'react-icons/fa6': Fa6Icons,
  fa6: Fa6Icons,
  'react-icons/tb': TbIcons,
  tb: TbIcons,
  lucide: lucideIconMap,
  'lucide-react': lucideIconMap,
};

/**
 * DynamicIcon
 * Renders an icon by name + library stored in the database.
 *
 * @param {string} iconName     - e.g. "FaReact", "SiNextdotjs", "Code2"
 * @param {string} iconLibrary  - e.g. "react-icons/fa", "react-icons/si", "lucide-react"
 * @param {string} className    - Tailwind classes (size, color, etc.)
 * @param {number} size         - Icon pixel size (default 18)
 */
const DynamicIcon = memo(({ iconName, iconLibrary, className = '', size = 18 }) => {
  if (!iconName) {
    return <Code2 size={size} className={className} />;
  }

  // 1. Try from mapped library
  if (iconLibrary) {
    const lib = libraryMap[iconLibrary.toLowerCase()];
    if (lib) {
      const IconComponent = lib[iconName];
      if (IconComponent) {
        return <IconComponent size={size} className={className} />;
      }
    }
  }

  // 2. Search all libraries in priority order
  const searchOrder = [FaIcons, SiIcons, lucideIconMap, Fa6Icons, TbIcons];
  for (const lib of searchOrder) {
    const IconComponent = lib[iconName];
    if (IconComponent) {
      return <IconComponent size={size} className={className} />;
    }
  }

  // 3. Fallback
  return <Code2 size={size} className={className} />;
});

DynamicIcon.displayName = 'DynamicIcon';

export default DynamicIcon;
