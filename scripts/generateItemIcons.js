import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/assets/items');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const SETS = [
  {
    prefix: 'warrior',
    setName: 'Kanlı Çelik Muhafızı',
    className: 'Savaşçı',
    bgStart: '#1b0507',
    bgEnd: '#3b0d14',
    accent1: '#f43f5e',
    accent2: '#e11d48',
    glow: '#be123c',
    gold: '#fbbf24',
    rune: '⚔',
  },
  {
    prefix: 'ninja',
    setName: 'Gölge Pençesi',
    className: 'Ninja',
    bgStart: '#051410',
    bgEnd: '#092e22',
    accent1: '#34d399',
    accent2: '#059669',
    glow: '#047857',
    gold: '#a7f3d0',
    rune: '🥷',
  },
  {
    prefix: 'mage',
    setName: 'Arcane Yıldızı',
    className: 'Büyücü',
    bgStart: '#061026',
    bgEnd: '#132048',
    accent1: '#38bdf8',
    accent2: '#818cf8',
    glow: '#2563eb',
    gold: '#c084fc',
    rune: '🔮',
  },
];

const SLOTS = [
  {
    id: 'helmet',
    name: 'Miğferi',
    svgArt: (c) => `
      <!-- Helmet Crest -->
      <path d="M128 36 L118 64 L138 64 Z" fill="${c.gold}" opacity="0.9"/>
      <path d="M128 28 L124 50 L132 50 Z" fill="#ffffff" opacity="0.8"/>
      <!-- Main Helmet Dome -->
      <path d="M72 130 C72 74 94 58 128 58 C162 58 184 74 184 130 C184 165 170 196 156 208 L142 195 L114 195 L100 208 C86 196 72 165 72 130 Z" 
            fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="3"/>
      <!-- Cheeks & Visor Plates -->
      <path d="M85 125 L105 130 L105 170 L82 155 Z" fill="${c.accent2}" stroke="${c.accent1}" stroke-width="1.5"/>
      <path d="M171 125 L151 130 L151 170 L174 155 Z" fill="${c.accent2}" stroke="${c.accent1}" stroke-width="1.5"/>
      <!-- Eye Slit -->
      <polygon points="102,122 120,126 128,124 136,126 154,122 148,132 128,136 108,132" fill="#05070a"/>
      <ellipse cx="116" cy="127" rx="6" ry="2" fill="${c.accent1}" filter="url(#glow)"/>
      <ellipse cx="140" cy="127" rx="6" ry="2" fill="${c.accent1}" filter="url(#glow)"/>
      <!-- Forehead Gem -->
      <polygon points="128,74 136,88 128,102 120,88" fill="${c.gold}" stroke="#ffffff" stroke-width="1"/>
      <circle cx="128" cy="88" r="4" fill="${c.accent1}" filter="url(#glow)"/>
    `,
  },
  {
    id: 'armor',
    name: 'Zırhı',
    svgArt: (c) => `
      <!-- Pauldrons (Shoulders) -->
      <path d="M46 100 C40 82 70 70 94 82 L88 125 C64 125 50 115 46 100 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2.5"/>
      <path d="M210 100 C216 82 186 70 162 82 L168 125 C192 125 206 115 210 100 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2.5"/>
      <!-- Chestplate Cuirass -->
      <path d="M84 85 L128 98 L172 85 L180 145 C176 185 152 215 128 222 C104 215 80 185 76 145 Z" 
            fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="3"/>
      <!-- Core Emblem / Gem -->
      <path d="M128 114 L142 134 L128 154 L114 134 Z" fill="${c.accent2}" stroke="${c.accent1}" stroke-width="2"/>
      <circle cx="128" cy="134" r="6" fill="${c.accent1}" filter="url(#glow)"/>
      <!-- Rib Filigree Lines -->
      <path d="M100 160 Q128 175 156 160" stroke="${c.gold}" stroke-width="2" fill="none" opacity="0.8"/>
      <path d="M106 180 Q128 192 150 180" stroke="${c.gold}" stroke-width="2" fill="none" opacity="0.8"/>
      <!-- Neck Gorget -->
      <path d="M105 85 Q128 100 151 85" stroke="${c.accent1}" stroke-width="3" fill="none"/>
    `,
  },
  {
    id: 'weapon',
    name: 'Silahı',
    svgArt: (c) => `
      <!-- Diagonal Sword / Staff Blade -->
      <g transform="rotate(45 128 128)">
        <!-- Blade Glow & Body -->
        <path d="M124 24 L128 12 L132 24 L134 165 L122 165 Z" fill="#ffffff" filter="url(#glow)" opacity="0.7"/>
        <path d="M123 20 L128 8 L133 20 L135 168 L128 172 L121 168 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2"/>
        <!-- Full Blood/Mana Groove -->
        <line x1="128" y1="26" x2="128" y2="155" stroke="${c.accent1}" stroke-width="2.5"/>
        <!-- Crossguard -->
        <path d="M96 172 C110 168 146 168 160 172 L154 184 L102 184 Z" fill="${c.gold}" stroke="#000000" stroke-width="1.5"/>
        <circle cx="128" cy="178" r="4" fill="${c.accent1}" filter="url(#glow)"/>
        <!-- Grip -->
        <rect x="124" y="184" width="8" height="38" rx="2" fill="#1e1b18" stroke="${c.gold}" stroke-width="1.5"/>
        <line x1="124" y1="194" x2="132" y2="194" stroke="${c.gold}" stroke-width="1"/>
        <line x1="124" y1="204" x2="132" y2="204" stroke="${c.gold}" stroke-width="1"/>
        <line x1="124" y1="214" x2="132" y2="214" stroke="${c.gold}" stroke-width="1"/>
        <!-- Pommel -->
        <polygon points="128,222 136,232 128,242 120,232" fill="${c.gold}" stroke="${c.accent2}" stroke-width="1.5"/>
        <circle cx="128" cy="232" r="3" fill="${c.accent1}"/>
      </g>
    `,
  },
  {
    id: 'offhand',
    name: 'Hançeri',
    svgArt: (c) => `
      <!-- Offhand Dagger / Buckler Shield -->
      <g transform="rotate(-30 128 128)">
        <!-- Dagger Blade -->
        <path d="M125 45 L128 30 L131 45 L135 145 L121 145 Z" fill="url(#grad_${c.prefix})" stroke="${c.accent1}" stroke-width="2"/>
        <line x1="128" y1="42" x2="128" y2="135" stroke="#ffffff" stroke-width="1.5" opacity="0.9"/>
        <!-- Guard with Winged Curves -->
        <path d="M100 148 Q128 138 156 148 L150 158 Q128 150 106 158 Z" fill="${c.gold}" stroke="${c.accent2}" stroke-width="1.5"/>
        <circle cx="128" cy="153" r="3.5" fill="${c.accent1}" filter="url(#glow)"/>
        <!-- Handle -->
        <rect x="124" y="158" width="8" height="32" rx="2" fill="#2d1519" stroke="${c.gold}" stroke-width="1.5"/>
        <!-- Pommel -->
        <circle cx="128" cy="198" r="8" fill="${c.gold}" stroke="${c.accent1}" stroke-width="1.5"/>
        <circle cx="128" cy="198" r="4" fill="${c.accent1}"/>
      </g>
    `,
  },
  {
    id: 'necklace',
    name: 'Kolyesi',
    svgArt: (c) => `
      <!-- Chain Curve -->
      <path d="M68 60 C80 135 176 135 188 60" fill="none" stroke="${c.gold}" stroke-width="3" stroke-dasharray="4,3"/>
      <!-- Filigree Setting Holder -->
      <path d="M112 135 L128 118 L144 135 L128 148 Z" fill="${c.gold}" stroke="${c.accent2}" stroke-width="2"/>
      <!-- Center Glowing Gemstone -->
      <polygon points="128,142 152,165 128,206 104,165" fill="${c.accent2}" stroke="${c.gold}" stroke-width="2.5"/>
      <polygon points="128,148 144,166 128,198 112,166" fill="${c.accent1}" filter="url(#glow)"/>
      <polygon points="128,154 136,166 128,188 120,166" fill="#ffffff" opacity="0.7"/>
    `,
  },
  {
    id: 'ring1',
    name: 'Yüzüğü I',
    svgArt: (c) => `
      <!-- Ring Band Outer -->
      <circle cx="128" cy="138" r="54" fill="none" stroke="${c.gold}" stroke-width="10"/>
      <circle cx="128" cy="138" r="48" fill="none" stroke="#000000" stroke-width="2"/>
      <!-- Inner Hole -->
      <circle cx="128" cy="138" r="42" fill="url(#bg_${c.prefix})"/>
      <!-- Ring Crown / Mount -->
      <path d="M106 88 L128 72 L150 88 L140 100 L116 100 Z" fill="${c.gold}" stroke="#000000" stroke-width="1.5"/>
      <!-- Inset Gemstone I -->
      <polygon points="128,68 140,82 128,96 116,82" fill="${c.accent1}" stroke="#ffffff" stroke-width="1.5" filter="url(#glow)"/>
      <circle cx="128" cy="82" r="3" fill="#ffffff"/>
      <!-- Roman Numeral I -->
      <text x="128" y="146" font-family="monospace" font-size="20" font-weight="bold" fill="${c.gold}" text-anchor="middle">I</text>
    `,
  },
  {
    id: 'ring2',
    name: 'Yüzüğü II',
    svgArt: (c) => `
      <!-- Ring Band Outer -->
      <circle cx="128" cy="138" r="54" fill="none" stroke="${c.gold}" stroke-width="10"/>
      <circle cx="128" cy="138" r="48" fill="none" stroke="#000000" stroke-width="2"/>
      <!-- Inner Hole -->
      <circle cx="128" cy="138" r="42" fill="url(#bg_${c.prefix})"/>
      <!-- Ring Crown / Mount Dual Gem -->
      <path d="M100 86 L128 68 L156 86 L144 100 L112 100 Z" fill="${c.gold}" stroke="#000000" stroke-width="1.5"/>
      <!-- Inset Gemstone II -->
      <polygon points="128,64 144,80 128,98 112,80" fill="${c.accent2}" stroke="#ffffff" stroke-width="1.5" filter="url(#glow)"/>
      <circle cx="128" cy="80" r="4" fill="${c.accent1}"/>
      <!-- Roman Numeral II -->
      <text x="128" y="146" font-family="monospace" font-size="18" font-weight="bold" fill="${c.gold}" text-anchor="middle">II</text>
    `,
  },
  {
    id: 'gloves',
    name: 'Eldiveni',
    svgArt: (c) => `
      <!-- Gauntlet Cuff -->
      <path d="M84 150 L172 150 L164 212 L92 212 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2.5"/>
      <path d="M96 170 Q128 180 160 170" stroke="${c.accent1}" stroke-width="2" fill="none"/>
      <!-- Hand & Palm -->
      <path d="M90 148 L90 110 L166 110 L166 148 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2"/>
      <!-- Four Articulated Fingers -->
      <rect x="92" y="58" width="14" height="52" rx="6" fill="${c.accent2}" stroke="${c.gold}" stroke-width="1.5"/>
      <rect x="110" y="48" width="15" height="62" rx="6" fill="${c.accent2}" stroke="${c.gold}" stroke-width="1.5"/>
      <rect x="129" y="52" width="15" height="58" rx="6" fill="${c.accent2}" stroke="${c.gold}" stroke-width="1.5"/>
      <rect x="148" y="66" width="14" height="44" rx="6" fill="${c.accent2}" stroke="${c.gold}" stroke-width="1.5"/>
      <!-- Thumb -->
      <rect x="74" y="108" width="18" height="36" rx="6" transform="rotate(-30 80 120)" fill="${c.accent2}" stroke="${c.gold}" stroke-width="1.5"/>
      <!-- Back of Hand Gem -->
      <polygon points="128,120 136,130 128,140 120,130" fill="${c.gold}"/>
      <circle cx="128" cy="130" r="3.5" fill="${c.accent1}" filter="url(#glow)"/>
    `,
  },
  {
    id: 'boots',
    name: 'Çizmesi',
    svgArt: (c) => `
      <!-- Leg Greave Armor -->
      <path d="M94 48 L162 48 L152 145 L104 145 Z" fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2.5"/>
      <!-- Knee Guard -->
      <polygon points="128,34 148,50 128,66 108,50" fill="${c.gold}" stroke="#000000" stroke-width="1"/>
      <circle cx="128" cy="50" r="4" fill="${c.accent1}" filter="url(#glow)"/>
      <!-- Foot Plate & Ankle -->
      <path d="M104 145 L148 145 L156 170 L188 195 L188 214 L88 214 L88 180 L104 145 Z" 
            fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="2.5"/>
      <!-- Spur / Winged Ankle Accent -->
      <path d="M84 175 L62 165 L76 188 Z" fill="${c.gold}" stroke="${c.accent2}" stroke-width="1.5"/>
      <!-- Tread/Sole -->
      <rect x="86" y="212" width="104" height="8" rx="2" fill="#0b0e14" stroke="${c.gold}" stroke-width="1.5"/>
    `,
  },
  {
    id: 'belt',
    name: 'Kemeri',
    svgArt: (c) => `
      <!-- Belt Strap Background -->
      <rect x="42" y="112" width="172" height="32" rx="4" fill="#141822" stroke="${c.gold}" stroke-width="2"/>
      <line x1="42" y1="128" x2="214" y2="128" stroke="${c.accent1}" stroke-width="2" stroke-dasharray="6,4"/>
      <!-- Ornate Center Buckle Plate -->
      <path d="M100 100 L128 88 L156 100 L166 156 L128 174 L90 156 Z" 
            fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="3"/>
      <!-- Center Buckle Crest Gem -->
      <circle cx="128" cy="128" r="16" fill="${c.gold}" stroke="${c.accent2}" stroke-width="2"/>
      <polygon points="128,116 138,128 128,140 118,128" fill="${c.accent1}" filter="url(#glow)"/>
      <circle cx="128" cy="128" r="3" fill="#ffffff"/>
      <!-- Hanging Tassels / Side Metal Plates -->
      <rect x="74" y="144" width="14" height="42" rx="2" fill="${c.gold}" stroke="#000000" stroke-width="1"/>
      <rect x="168" y="144" width="14" height="42" rx="2" fill="${c.gold}" stroke="#000000" stroke-width="1"/>
    `,
  },
  {
    id: 'cloak',
    name: 'Pelerini',
    svgArt: (c) => `
      <!-- Brooches on Collar -->
      <circle cx="94" cy="62" r="8" fill="${c.gold}" stroke="${c.accent1}" stroke-width="1.5"/>
      <circle cx="94" cy="62" r="4" fill="${c.accent1}"/>
      <circle cx="162" cy="62" r="8" fill="${c.gold}" stroke="${c.accent1}" stroke-width="1.5"/>
      <circle cx="162" cy="62" r="4" fill="${c.accent1}"/>
      <line x1="102" y1="62" x2="154" y2="62" stroke="${c.gold}" stroke-width="2"/>
      <!-- Flowing Cloak Fabric -->
      <path d="M90 68 C80 120 54 185 64 220 C84 210 112 216 128 206 C144 216 172 210 192 220 C202 185 176 120 166 68 Z" 
            fill="url(#grad_${c.prefix})" stroke="${c.gold}" stroke-width="3"/>
      <!-- Deep Inner Shadow Folds -->
      <path d="M102 75 C108 130 98 175 106 210" stroke="${c.accent2}" stroke-width="3" fill="none" opacity="0.8"/>
      <path d="M154 75 C148 130 158 175 150 210" stroke="${c.accent2}" stroke-width="3" fill="none" opacity="0.8"/>
      <!-- Hem Trim -->
      <path d="M64 220 Q128 200 192 220" stroke="${c.gold}" stroke-width="3" fill="none"/>
    `,
  },
  {
    id: 'wings',
    name: 'Kanatları',
    svgArt: (c) => `
      <!-- Ethereal Glow Backing -->
      <g filter="url(#glow)">
        <!-- Left Wing Primary Feather Rays -->
        <path d="M128 130 C90 80 40 46 22 74 C16 98 64 125 128 150 Z" fill="${c.accent1}" opacity="0.8"/>
        <path d="M128 140 C80 110 32 100 24 124 C18 146 72 155 128 165 Z" fill="${c.accent2}" opacity="0.7"/>
        <path d="M128 150 C76 140 44 148 40 168 C36 186 86 180 128 180 Z" fill="${c.accent1}" opacity="0.6"/>
        <!-- Right Wing Primary Feather Rays -->
        <path d="M128 130 C166 80 216 46 234 74 C240 98 192 125 128 150 Z" fill="${c.accent1}" opacity="0.8"/>
        <path d="M128 140 C176 110 224 100 232 124 C238 146 184 155 128 165 Z" fill="${c.accent2}" opacity="0.7"/>
        <path d="M128 150 C180 140 212 148 216 168 C220 186 170 180 128 180 Z" fill="${c.accent1}" opacity="0.6"/>
      </g>
      <!-- Core Wing Bone / Crystal Mount -->
      <polygon points="128,110 138,135 128,160 118,135" fill="${c.gold}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="128" cy="135" r="5" fill="#ffffff" filter="url(#glow)"/>
    `,
  },
];

function generateSvg(set, slot) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bg_${set.prefix}" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${set.bgEnd}"/>
      <stop offset="85%" stop-color="${set.bgStart}"/>
      <stop offset="100%" stop-color="#020406"/>
    </radialGradient>
    
    <!-- Item Surface Gradient -->
    <linearGradient id="grad_${set.prefix}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${set.accent1}"/>
      <stop offset="50%" stop-color="${set.accent2}"/>
      <stop offset="100%" stop-color="${set.bgStart}"/>
    </linearGradient>

    <!-- Glow Filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Dark Ornate Background Canvas -->
  <rect width="256" height="256" rx="20" fill="url(#bg_${set.prefix})"/>
  
  <!-- Outer Ornate Elven Gold Border -->
  <rect x="8" y="8" width="240" height="240" rx="14" fill="none" stroke="${set.gold}" stroke-width="2" opacity="0.6"/>
  <rect x="14" y="14" width="228" height="228" rx="10" fill="none" stroke="${set.accent1}" stroke-width="1" opacity="0.3"/>
  
  <!-- Corner Filigree Diamonds -->
  <polygon points="14,14 20,8 26,14 20,20" fill="${set.gold}"/>
  <polygon points="242,14 248,8 236,8 242,20" fill="${set.gold}"/>
  <polygon points="14,242 20,248 26,242 20,236" fill="${set.gold}"/>
  <polygon points="242,242 248,248 236,248 242,236" fill="${set.gold}"/>

  <!-- Ambient Magic Aura -->
  <circle cx="128" cy="128" r="80" fill="${set.glow}" opacity="0.25" filter="url(#glow)"/>

  <!-- Background Arcane Runic Ring -->
  <circle cx="128" cy="128" r="88" fill="none" stroke="${set.gold}" stroke-width="1" stroke-dasharray="6,8" opacity="0.25"/>

  <!-- Main Slot Illustrated Artwork -->
  ${slot.svgArt(set)}

  <!-- Item Level & Set Badge -->
  <g transform="translate(18, 222)">
    <rect width="64" height="18" rx="4" fill="#000000" opacity="0.75" stroke="${set.gold}" stroke-width="1"/>
    <text x="32" y="13" font-family="'Cinzel', sans-serif" font-size="10" font-weight="bold" fill="${set.gold}" text-anchor="middle">Lv. 1-10</text>
  </g>
</svg>`;
}

let generatedCount = 0;

for (const set of SETS) {
  for (const slot of SLOTS) {
    const fileName = `${set.prefix}_${slot.id}.svg`;
    const filePath = path.join(outDir, fileName);
    const content = generateSvg(set, slot);
    fs.writeFileSync(filePath, content, 'utf8');
    generatedCount++;
  }
}

console.log(`Successfully generated ${generatedCount} high-res elven SVG item artwork files in ${outDir}!`);
